"use client";

import { Toasts } from "./common";
import { GameProvider, useGame } from "./GameProvider";
import { Briefing } from "./screens/Briefing";
import { Desk } from "./screens/Desk";
import { DayEnd, RunEnd } from "./screens/End";
import { Achievements, HowTo, SettingsScreen } from "./screens/Menus";
import { Review } from "./screens/Review";
import { Title } from "./screens/Title";

function GameScreen() {
  const { s } = useGame();
  if (!s.run) return <Title />;
  switch (s.run.phase.kind) {
    case "briefing":
      return <Briefing />;
    case "case":
      return <Desk />;
    case "review":
      return <Review />;
    case "dayEnd":
      return <DayEnd />;
    case "ended":
      return <RunEnd />;
  }
}

function Screens() {
  const { s } = useGame();
  const screen = (() => {
    switch (s.screen) {
      case "title":
        return <Title />;
      case "game":
        return <GameScreen />;
      case "achievements":
        return <Achievements />;
      case "howto":
        return <HowTo />;
      case "settings":
        return <SettingsScreen />;
    }
  })();
  const phase = s.screen === "game" ? s.run?.phase.kind : s.screen;
  return (
    <div className="app" data-screen={phase}>
      <div key={phase} className="screen-in contents-wrap">
        {screen}
      </div>
      <Toasts />
      {s.settings.crt && <div className="crt" aria-hidden />}
    </div>
  );
}

export function Game() {
  return (
    <GameProvider>
      <Screens />
    </GameProvider>
  );
}
