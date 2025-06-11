import { personaSaveManager } from './persona';
import { modelSaveManager } from './model';
import { botSkillSaveManager } from './bot-skill';

const managers = [personaSaveManager, botSkillSaveManager, modelSaveManager];

export const autosaveManager = {
  start: () => {
    console.log('start:>>');
    managers.forEach(manager => {
      manager.start();
    });
  },
  close: () => {
    console.log('close:>>');
    managers.forEach(manager => {
      manager.close();
    });
  },
};
