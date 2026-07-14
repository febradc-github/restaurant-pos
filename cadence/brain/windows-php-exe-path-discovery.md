---
type: process
tags: [process/environment]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: []
sources: []
---

# Windows PHP PATH Discovery

During C-11 implementation, php command was not found on PATH despite vendor/ being installed and artisan working. On this Windows dev environment (Windows 11 Pro), the solution was to locate and use php.exe directly via winget-installed PHP at:

`C:\Users\Dan\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe`

This path was found by exploring WinGet package directories. Future coder dispatches on this machine should reference this location or consider adding it to PATH to avoid rediscovery overhead. User (Dan) may also want to configure PATH globally so php is available from any terminal.
