# attack-shark-x11-driver

[![npm version](https://img.shields.io/npm/v/attack-shark-x11-driver.svg)](https://www.npmjs.com/package/attack-shark-x11-driver)
[![license](https://img.shields.io/npm/l/attack-shark-x11-driver.svg)](https://github.com/HarukaYamamoto0/attack-shark-x11-driver/blob/main/LICENSE)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/HarukaYamamoto0/attack-shark-x11-driver)

A TypeScript driver for the **Attack Shark X11 gaming mouse**, providing cross-platform support (focused on Linux) to configure DPI, macros, lighting, and polling rates via USB HID.

The official software is Windows-only; this project provides a way to interact with the device on any platform supported by Node.js or Bun. This fork adds a **local web UI** so Linux users can configure the mouse visually without needing the official Windows companion app.

## Features

- ✅ **DPI Configuration**: Set stages and active stage.
- ✅ **Button Remapping**: Fully customizable button behavior.
- ✅ **Macros**: Support for custom macros and templates.
- ✅ **Lighting Control**: Change modes and speeds.
- ✅ **Polling Rate**: Support for 125 Hz to 1000 Hz.
- ✅ **Battery Status**: Real-time battery monitoring.
- ✅ **Cross-platform**: Works on Linux, macOS, and Windows.
- ✅ **Web UI**: Local browser-based configuration interface for Linux.

## Installation

```bash
bun add attack-shark-x11-driver
# or
npm install attack-shark-x11-driver
```

## Quick Start

```typescript
import { AttackSharkX11, ConnectionMode, Rate } from 'attack-shark-x11-driver';

const driver = new AttackSharkX11({
	connectionMode: ConnectionMode.Adapter, // or Wired
	delayMs: 300, // Recommended safe delay between packets
});

try {
	await driver.open();

	// Set Polling Rate to 1000Hz (eSports)
	await driver.setPollingRate(Rate.eSports);

	// Configure DPI Stages
	await driver.setDpi({
		dpiValues: [800, 1600, 2400, 3200, 5000, 22000],
		activeStage: 2,
	});

	// Get Battery Level
	const battery = await driver.getBatteryLevel();
	console.log(`Battery: ${battery}%`);
} catch (error) {
	console.error('Driver error:', error);
} finally {
	await driver.close();
}
```

## Linux Setup (udev)

To access the device without root permissions on Linux, you need to create a udev rule.

1. Create the rule file:
    ```bash
    sudo nano /etc/udev/rules.d/99-attack-shark-x11.rules
    ```

2. Add the following lines:

    **Debian/Ubuntu** (uses `plugdev` group):
    ```
    SUBSYSTEM=="usb", ATTR{idVendor}=="1d57", ATTR{idProduct}=="fa60", MODE="0660", GROUP="plugdev"
    SUBSYSTEM=="usb", ATTR{idVendor}=="1d57", ATTR{idProduct}=="fa55", MODE="0660", GROUP="plugdev"
    ```

    **Fedora/Nobara** (`plugdev` does not exist — use your username):
    ```
    SUBSYSTEM=="usb", ATTR{idVendor}=="1d57", ATTR{idProduct}=="fa60", MODE="0660", OWNER="your-username"
    SUBSYSTEM=="usb", ATTR{idVendor}=="1d57", ATTR{idProduct}=="fa55", MODE="0660", OWNER="your-username"
    ```

3. Reload rules:
    ```bash
    sudo udevadm control --reload-rules && sudo udevadm trigger
    ```

4. Replug the USB receiver. Verify permissions:
    ```bash
    lsusb | grep 1d57   # note the bus and device numbers
    ls -la /dev/bus/usb/BUS/DEVICE
    ```

## Web UI

A local browser-based configuration interface included in the `web-ui/` directory. This exists because the official Attack Shark web driver (`szslxd-tech.com`) relies on a Windows-only companion app and does not work on Linux.

### Requirements

- Node.js 18+
- A Chromium-based browser (Vivaldi, Chrome, Chromium)

### Running the Web UI

```bash
cd web-ui
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

### Web UI Features

- **DPI** — configure up to 6 stages (100–22,000 DPI), set the active stage
- **Polling Rate** — 125 / 250 / 500 / 1000 Hz
- **Lighting** — 7 modes (Off, Static, Breathing, Neon, Color Breathing, Static DPI, Breathing DPI), RGB color picker, speed control
- **Power & Response** — sleep timer, deep sleep timer, key debounce
- **Battery** — live battery level readout
- Apply settings per section or all at once with the Apply All button

### Optional: Start Menu Shortcut

Create a `.desktop` file to launch the server and open the UI in one click:

```bash
cat > ~/.local/share/applications/attackshark.desktop << 'EOF'
[Desktop Entry]
Name=Attack Shark X11
Comment=Mouse configuration UI
Exec=bash -c 'cd /path/to/web-ui && npm start & sleep 2 && your-browser http://localhost:3000'
Icon=input-mouse
Terminal=false
Type=Application
Categories=Settings;HardwareSettings;
EOF
update-desktop-database ~/.local/share/applications/
```

Replace `/path/to/web-ui` with the absolute path to the `web-ui/` folder, and `your-browser` with your browser command (e.g. `flatpak run com.vivaldi.Vivaldi` for Flatpak Vivaldi).

> **Note:** The `sleep 2` delay gives the server time to start before the browser opens. Increase to `sleep 3` on slower machines.

## Supported Hardware

| Device           | Mode            | Status     |
|------------------|-----------------|------------|
| Attack Shark X11 | Wired           | Supported  |
| Attack Shark X11 | 2.4GHz wireless | Supported  |
| Attack Shark X11 | Bluetooth       | Not tested |

_Note: Attack Shark R1 might be compatible but hasn't been verified yet._

## Important Warnings ⚠️

- **Packet Delay**: Sending configuration packets too quickly can cause the firmware to hang. Always maintain at least a **250 ms** (500 ms recommended) delay between commands.
- **Recovery**: If the mouse stops responding, switch it to Bluetooth mode for a few seconds, then back to 2.4 GHz/Wired.

## Contributing

This project is a reverse-engineering effort. Contributions such as protocol documentation, new features, or testing with different hardware are very welcome.

- **Protocol Docs**: See `docs/` for packet analysis.
- **Tools used**: Wireshark, USBPcap.

## License

MIT © [HarukaYamamoto0](https://github.com/HarukaYamamoto0)

---

_Disclaimer: This project is not affiliated with Attack Shark. Use at your own risk._
