"""Render the reviewed episode translation using locally supplied Piper voices.

No model downloading is performed. Runtime telemetry is explicitly disabled.
Requires piper-tts==1.8.0, onnxruntime==1.29.0 and ffmpeg.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess
import wave

from offline_audio import restrict_network
restrict_network()

import onnxruntime
onnxruntime.disable_telemetry_events()
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
VOICES = {'de': 'de_DE-thorsten-high', 'en': 'en_US-ljspeech-high'}


def render(language, voices_dir, work_dir):
    model = voices_dir / (VOICES[language] + '.onnx')
    if not model.is_file() or not Path(str(model) + '.json').is_file():
        raise FileNotFoundError(f'Local voice and configuration required: {model}')
    paragraphs = [p.strip() for p in (ROOT / 'podcast-scripts' / f'60-yas-uzerinde.{language}.txt').read_text().split('\n\n') if p.strip()]
    work_dir.mkdir(parents=True, exist_ok=True)
    wav_path = work_dir / f'60-yas-uzerinde.{language}.wav'
    voice = PiperVoice.load(model, download_dir=work_dir)
    config = SynthesisConfig(length_scale=1.15, noise_scale=0.6, noise_w_scale=0.75, normalize_audio=False)
    sample_rate = voice.config.sample_rate
    with wave.open(str(wav_path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(sample_rate)
        output.writeframes(b'\0\0' * int(sample_rate * 0.25))
        for index, paragraph in enumerate(paragraphs, 1):
            for chunk in voice.synthesize(paragraph, syn_config=config):
                assert chunk.sample_channels == 1 and chunk.sample_rate == sample_rate
                output.writeframes(chunk.audio_int16_bytes)
                output.writeframes(b'\0\0' * int(sample_rate * 0.15))
            output.writeframes(b'\0\0' * int(sample_rate * 0.4))
            print(f'{language}: paragraph {index}/{len(paragraphs)}', flush=True)
    # Measure before applying a constant loudness correction to spoken audio.
    analysis = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', str(wav_path), '-af', 'loudnorm=I=-19:TP=-2:LRA=7:print_format=json', '-f', 'null', '-'], capture_output=True, text=True, check=True)
    levels = json.loads(re.findall(r'\{[^{}]*\}', analysis.stderr)[-1])
    correction = (f"loudnorm=I=-19:TP=-2:LRA=7:measured_I={levels['input_i']}:measured_TP={levels['input_tp']}:measured_LRA={levels['input_lra']}:measured_thresh={levels['input_thresh']}:offset={levels['target_offset']}:linear=true")
    output_path = ROOT / 'ses' / f'60-yas-uzerinde.{language}.mp3'
    title = {'de': 'Über 60 Jahre alt – Deutsche Übersetzung', 'en': 'Over 60 Years Old – English Translation'}[language]
    subprocess.run(['ffmpeg', '-y', '-nostdin', '-hide_banner', '-loglevel', 'error', '-i', str(wav_path), '-af', correction, '-ar', '22050', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', '-id3v2_version', '3', '-metadata', f'title={title}', '-metadata', 'artist=Yaşama Dair', '-metadata', f"language={dict(de='deu', en='eng')[language]}", '-metadata', 'comment=AI-narrated translation. The original recording ends mid-sentence.', str(output_path)], check=True)
    print(f'READY {output_path.name}: {output_path.stat().st_size} bytes', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--language', choices=VOICES, required=True)
    parser.add_argument('--voices-dir', type=Path, required=True)
    parser.add_argument('--work-dir', type=Path, required=True)
    args = parser.parse_args()
    render(args.language, args.voices_dir, args.work_dir)
