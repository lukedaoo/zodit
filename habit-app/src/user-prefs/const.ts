export interface ConstPref {
    key: string;
    defaultValue: any;
}

export const SEPARATOR_PREF_KEY: ConstPref = {
    key: 'template_separator',
    defaultValue: ';'
};

export const USE_TEMPLATE_WHEN_ADDING_TASK: ConstPref = {
    key: 'user_pref_use_template_when_adding_task',
    defaultValue: false
}

export const USER_THEME = {
    key: 'user_theme',
    defaultValue: 'system'
}

export const GROUP_COLLAPSE_THRESHOLD: ConstPref = {
    key: 'group_collapse_threshold',
    defaultValue: 3
}

export const TASK_COLLAPSE_THRESHOLD: ConstPref = {
    key: 'task_collapse_threshold',
    defaultValue: 3
}
