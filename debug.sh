#!/bin/bash

export G_MESSAGES_DEBUG=all
export MUTTER_DEBUG_DUMMY_MODE_SPECS=1366x768
export SHELL_DEBUG=backtrace-warnings

dbus-run-session -- gnome-shell --nested --wayland
