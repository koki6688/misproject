var level = [{"0": [{"exp": 0}, {"char": "初心者"}]}, {"1": [{"exp": 1}, {"char": "學徒"}]},
    {"2": [{"exp": 3}, {"char": "魔法見習生"}]}, {"3": [{"exp": 6}, {"char": "初級魔法師"}]},
    {"4": [{"exp": 11}, {"char": "中級魔法師"}]}, {"5": [{"exp": 19}, {"char": "高級魔法師"}]},
    {"6": [{"exp": 32}, {"char": "大魔法師"}]}, {"7": [{"exp": 53}, {"char": "聖魔法師"}]},
    {"8": [{"exp": 87}, {"char": "魔導士"}]}, {"9": [{"exp": 142}, {"char": "大魔導士"}]},
    {"10": [{"exp": 231}, {"char": "聖魔導士"}]}, {"11": [{"exp": 375}, {"char": "究極魔導士"}]}];

function getLevel(exp) {
    var memberLevel;
    for (var i = 0; i < level.length; i++) {
        if (level[i][i].exp <= exp < level[i + 1][i + 1].exp) {
            memberLevel = i;
            break;
        }
    }
    var char = level[memberLevel][memberLevel].char;

    return [memberLevel,char];
}

module.exports.level = level;
module.exports.getLevel = getLevel;
