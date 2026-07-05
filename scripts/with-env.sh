#!/usr/bin/env bash
# Loads variables from .env (if present) into the shell environment, then
# runs the given command. Used so PORT (and other vars) from .env are
# honored by `next dev` / `next start`, which only read PORT from the
# process environment, not from .env directly.
set -a
[ -f .env ] && . ./.env
set +a
exec "$@"
