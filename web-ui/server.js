import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AttackSharkX11,
  ConnectionMode,
  DpiBuilder,
  PollingRateBuilder,
  UserPreferencesBuilder,
  LightMode,
  Rate,
} from 'attack-shark-x11-driver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let connectionMode = ConnectionMode.Adapter;

function getDriver() {
  return new AttackSharkX11({ connectionMode, delayMs: 400 });
}

async function withDriver(fn) {
  const driver = getDriver();
  await driver.open();
  try {
    return await fn(driver);
  } finally {
    await driver.close();
  }
}

// GET battery
app.get('/api/battery', async (req, res) => {
  try {
    const level = await withDriver(d => d.getBatteryLevel());
    res.json({ ok: true, level });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST connection mode
app.post('/api/connection', (req, res) => {
  const { mode } = req.body;
  connectionMode = mode === 'wired' ? ConnectionMode.Wired : ConnectionMode.Adapter;
  res.json({ ok: true, mode });
});

// POST DPI
app.post('/api/dpi', async (req, res) => {
  try {
    const { dpiValues, activeStage } = req.body;
    await withDriver(d => d.setDpi(new DpiBuilder({ dpiValues, activeStage })));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST polling rate
app.post('/api/polling', async (req, res) => {
  try {
    const { rate } = req.body;
    const rateMap = { 125: Rate.powerSaving, 250: Rate.office, 500: Rate.gaming, 1000: Rate.eSports };
    const r = rateMap[rate];
    if (!r) return res.status(400).json({ ok: false, error: 'Invalid rate' });
    await withDriver(d => d.setPollingRate(new PollingRateBuilder({ rate: r })));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST lighting
app.post('/api/lighting', async (req, res) => {
  try {
    const { lightMode, rgb, ledSpeed } = req.body;
    const modeMap = {
      off: LightMode.Off,
      static: LightMode.Static,
      breathing: LightMode.Breathing,
      neon: LightMode.Neon,
      colorBreathing: LightMode.ColorBreathing,
      staticDpi: LightMode.StaticDpi,
      breathingDpi: LightMode.BreathingDpi,
    };
    const mode = modeMap[lightMode];
    if (mode === undefined) return res.status(400).json({ ok: false, error: 'Invalid light mode' });
    await withDriver(d =>
      d.setUserPreferences(new UserPreferencesBuilder({ lightMode: mode, rgb, ledSpeed }))
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST sleep settings
app.post('/api/sleep', async (req, res) => {
  try {
    const { sleepTime, deepSleepTime, keyResponse } = req.body;
    await withDriver(d =>
      d.setUserPreferences(new UserPreferencesBuilder({ sleepTime, deepSleepTime, keyResponse }))
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Attack Shark X11 UI running at http://localhost:${PORT}`);
});
