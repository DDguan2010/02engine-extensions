(function(ext) {
    
    let database = {};
    
    
    if (localStorage.getItem('tw_database')) {
        try {
            database = JSON.parse(localStorage.getItem('tw_database'));
        } catch (e) {
            console.error('数据库加载失败:', e);
        }
    }
    
    
    function saveToStorage() {
        localStorage.setItem('tw_database', JSON.stringify(database));
    }
    
    
    ext.setData = function(key, value) {
        database[key] = value;
        saveToStorage();
    };
    
    
    ext.getData = function(key) {
        return database[key] || '';
    };
    
    
    ext.removeData = function(key) {
        delete database[key];
        saveToStorage();
    };
    
    
    ext.hasData = function(key) {
        return key in database;
    };
    
    
    ext.getAllKeys = function() {
        return Object.keys(database).join(',');
    };
    
    
    ext.clearAllData = function() {
        database = {};
        saveToStorage();
    };
    
    
    ext._shutdown = function() {
        
        saveToStorage();
    };
    
    ext._getStatus = function() {
        return {status: 2, msg: '数据库已就绪 (' + Object.keys(database).length + ' 条记录)'};
    };
    
    var descriptor = {
        blocks: [
            [' ', '设置数据 %s 为 %s', 'setData', '分数', '100'],
            ['r', '获取数据 %s', 'getData', '分数'],
            ['b', '存在数据 %s', 'hasData', '分数'],
            [' ', '删除数据 %s', 'removeData', '分数'],
            ['r', '获取所有键', 'getAllKeys'],
            [' ', '清除所有数据', 'clearAllData']
        ],
        menus: {
        },
        
    };
    
    ScratchExtensions.register('本地数据库', descriptor, ext);
})({});