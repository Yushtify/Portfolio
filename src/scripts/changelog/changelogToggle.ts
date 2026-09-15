import { CONFIG } from "./changelogConfig";
import { logWarn } from "./changelogLogger";
import type { SpinDirection } from "./changelogConfig";

const FILE_NAME = "changelogToggle.ts";

function playSpinAnimation(icon: HTMLElement, direction: SpinDirection): void {
  const animationConfig = CONFIG.ANIMATIONS[direction];
  icon.style.animation = `${animationConfig.name} ${animationConfig.duration} ${animationConfig.easing} forwards`;
}

function toggleVersionGroup(groupId: string): void {
  const groupElement = document.getElementById(groupId);
  if (!groupElement) {
    logWarn(FILE_NAME, `Version group ${groupId} not found while toggling.`);
    return;
  }
  const commitContainer = groupElement.querySelector<HTMLElement>(
    CONFIG.SELECTORS.COMMIT_CONTAINER,
  );
  if (!commitContainer) {
    logWarn(FILE_NAME, `Commit container not found inside ${groupId}.`);
    return;
  }
  const isCurrentlyVisible = commitContainer.classList.contains(
    CONFIG.TOGGLE.VISIBLE_CLASS,
  );
  commitContainer.classList.replace(
    isCurrentlyVisible
      ? CONFIG.TOGGLE.VISIBLE_CLASS
      : CONFIG.TOGGLE.HIDDEN_CLASS,
    isCurrentlyVisible
      ? CONFIG.TOGGLE.HIDDEN_CLASS
      : CONFIG.TOGGLE.VISIBLE_CLASS,
  );
  const toggleButton = groupElement.querySelector<HTMLElement>(
    CONFIG.SELECTORS.TOGGLE_BUTTON,
  );
  const icon = toggleButton?.querySelector<HTMLElement>(
    CONFIG.SELECTORS.TOGGLE_ICON,
  );
  if (icon) {
    playSpinAnimation(icon, isCurrentlyVisible ? "spinDown" : "spinUp");
  } else {
    logWarn(FILE_NAME, `Toggle icon not found inside ${groupId}.`);
  }
}

declare global {
  interface Window {
    toggleVersionGroup: (groupId: string) => void;
  }
}

window.toggleVersionGroup = toggleVersionGroup;
