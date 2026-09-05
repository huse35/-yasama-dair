"""Deny network syscalls for a local audio worker before importing its runtime.

This adds a process-local Linux kernel restriction. It does not alter host
permissions or approval controls. Failure to install the restriction is fatal.
"""
import ctypes
import ctypes.util
import errno
import socket


def restrict_network():
    library = ctypes.util.find_library('seccomp')
    if not library:
        raise RuntimeError('Offline audio rendering requires Linux libseccomp.')
    lib = ctypes.CDLL(library, use_errno=True)
    lib.seccomp_init.argtypes = [ctypes.c_uint32]
    lib.seccomp_init.restype = ctypes.c_void_p
    lib.seccomp_syscall_resolve_name.argtypes = [ctypes.c_char_p]
    lib.seccomp_syscall_resolve_name.restype = ctypes.c_int
    lib.seccomp_rule_add.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int, ctypes.c_uint]
    lib.seccomp_rule_add.restype = ctypes.c_int
    lib.seccomp_load.argtypes = [ctypes.c_void_p]
    lib.seccomp_load.restype = ctypes.c_int
    lib.seccomp_release.argtypes = [ctypes.c_void_p]
    lib.seccomp_release.restype = None
    context = lib.seccomp_init(0x7FFF0000)  # SCMP_ACT_ALLOW for unrelated calls.
    if not context:
        raise RuntimeError('Could not initialize offline audio sandbox.')
    try:
        for name in ('socket', 'socketpair', 'connect', 'sendto', 'sendmsg', 'sendmmsg', 'io_uring_setup'):
            syscall = lib.seccomp_syscall_resolve_name(name.encode())
            if syscall < 0 or lib.seccomp_rule_add(context, 0x00050000 | errno.EPERM, syscall, 0) != 0:
                raise RuntimeError(f'Could not block network syscall: {name}')
        if lib.seccomp_load(context) != 0:
            raise RuntimeError('Could not enforce offline audio sandbox.')
    finally:
        lib.seccomp_release(context)
    # Test socket creation locally, without contacting any remote destination.
    for family in (socket.AF_INET, socket.AF_INET6, socket.AF_UNIX):
        try:
            connection = socket.socket(family, socket.SOCK_STREAM)
        except PermissionError:
            continue
        connection.close()
        raise RuntimeError('Offline audio sandbox verification failed.')
    print('Verified: network access is blocked for this audio worker.', flush=True)


if __name__ == '__main__':
    restrict_network()
