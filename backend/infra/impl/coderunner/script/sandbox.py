import os
import dataclasses
import json
import subprocess
import time
from typing import Dict, Literal

Status = Literal["success", "error"]

PKG_NAME = "jsr:@langchain/pyodide-sandbox@0.0.4"

@dataclasses.dataclass(kw_only=True)
class Output:
    result: Dict = None
    stdout: str | None = None
    stderr: str | None = None
    status: Status
    execution_time: float

def build_permission_flag(
        flag: str,
        *,
        value: bool | list[str],
) -> str | None:
    if value is True:
        return flag
    if isinstance(value, list) and value:
        return f"{flag}={','.join(value)}"
    return None


class Sandbox:
    def __init__(
            self,
            *,
            allow_env: list[str] | bool = False,
            allow_read: list[str] | bool = False,
            allow_write: list[str] | bool = False,
            allow_net: list[str] | bool = False,
            allow_run: list[str] | bool = False,
            allow_ffi: list[str] | bool = False,
            node_modules_dir: str = "auto",
            **kwargs
    ) -> None:
        self.permissions = []

        perm_defs = [
            ("--allow-env", allow_env, None),
            ("--allow-read", allow_read, ["node_modules"]),
            ("--allow-write", allow_write, ["node_modules"]),
            ("--allow-net", allow_net, None),
            ("--allow-run", allow_run, None),
            ("--allow-ffi", allow_ffi, None),
        ]

        self.permissions = []
        for flag, value, defaults in perm_defs:
            perm = build_permission_flag(flag, value=value)
            if perm is None and defaults is not None:
                default_value = ",".join(defaults)
                perm = f"{flag}={default_value}"
            if perm:
                self.permissions.append(perm)

        self.permissions.append(f"--node-modules-dir={node_modules_dir}")

    def _build_command(
            self,
            code: str,
            *,
            session_bytes: bytes | None = None,
            session_metadata: dict | None = None,
            memory_limit_mb: int | None = 100,
            **kwargs
    ) -> list[str]:
        cmd = [
            "deno",
            "run",
        ]

        cmd.extend(self.permissions)

        v8_flags = ["--experimental-wasm-stack-switching"]

        if memory_limit_mb is not None and memory_limit_mb > 0:
            v8_flags.append(f"--max-old-space-size={memory_limit_mb}")

        cmd.append(f"--v8-flags={','.join(v8_flags)}")

        cmd.append(PKG_NAME)

        cmd.extend(["--code", code])

        if session_bytes:
            bytes_array = list(session_bytes)
            cmd.extend(["--session-bytes", json.dumps(bytes_array)])

        if session_metadata:
            cmd.extend(["--session-metadata", json.dumps(session_metadata)])

        return cmd

    def execute(
            self,
            code: str,
            *,
            session_bytes: bytes | None = None,
            session_metadata: dict | None = None,
            timeout_seconds: float | None = None,
            memory_limit_mb: int | None = None,
            **kwargs
    ) -> Output:
        start_time = time.time()
        stdout = ""
        result = None
        stderr: str
        status: Literal["success", "error"]
        cmd = self._build_command(
            code,
            session_bytes=session_bytes,
            session_metadata=session_metadata,
            memory_limit_mb=memory_limit_mb,
        )

        try:
            process = subprocess.run(
                cmd,
                capture_output=True,
                text=False,
                timeout=timeout_seconds,
                check=False,
            )

            stdout_bytes = process.stdout
            stderr_bytes = process.stderr

            stdout = stdout_bytes.decode("utf-8", errors="replace")

            if stdout:
                full_result = json.loads(stdout)
                stdout = full_result.get("stdout", None)
                stderr = full_result.get("stderr", None)
                result = full_result.get("result", None)
                status = "success" if full_result.get("success", False) else "error"
            else:
                stderr = stderr_bytes.decode("utf-8", errors="replace")
                status = "error"

        except subprocess.TimeoutExpired:
            status = "error"
            stderr = f"Execution timed out after {timeout_seconds} seconds"

        end_time = time.time()

        return Output(
            status=status,
            execution_time=end_time - start_time,
            stdout=stdout or None,
            stderr=stderr or None,
            result=result,
        )


prefix = """\
import json
import sys
import asyncio
class Args:
    def __init__(self, params):
        self.params = params

class Output(dict):
    pass

args = {}

"""

suffix = """\

result = None
try:
    result = asyncio.run(main(Args(args)))
except Exception as  e:
    print(f"{type(e).__name__}: {str(e)}", file=sys.stderr)
    sys.exit(1)
result
"""


if __name__ == "__main__":
    w = os.fdopen(3, "wb", )
    r = os.fdopen(4, "rb", )

    try:
        req = json.load(r)
        user_code, params, config = req["code"], req["params"], req["config"] or {}
        sandbox = Sandbox(**config)

        if params is not None:
            code = prefix + f'args={json.dumps(params)}\n' + user_code + suffix
        else:
            code = prefix + user_code + suffix

        resp = sandbox.execute(code, **config)
        result = json.dumps(dataclasses.asdict(resp), ensure_ascii=False)
        w.write(str.encode(result))
        w.flush()
        w.close()
    except Exception as e:
        print("sandbox exec error", e)
        w.write(str.encode(json.dumps({"sandbox_error": str(e)})))
        w.flush()
        w.close()