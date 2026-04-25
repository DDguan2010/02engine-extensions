// SF文件系统拓展 - 修改导出功能（只返回JSON字符串）
(function(Scratch) {
    'use strict';

    const EXTENSION_ID = 'sfFileSystem';
    const COOKIE_NAME = 'sf_file_system_data';
    const COOKIE_EXPIRY_DAYS = 365;
    let fsData = {};
    let fileManagerWindow = null;
    let currentProjectId = 'default_' + new Date().getTime();
    let selectedItem = null;
    let isDragging = false;
    let dragStartX, dragStartY, windowStartX, windowStartY;

    // ========== Cookie存储函数 ==========
    const getCookie = (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    };

    const setCookie = (name, value, days) => {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        const encodedValue = encodeURIComponent(JSON.stringify(value));
        document.cookie = name + "=" + encodedValue + expires + "; path=/; SameSite=Strict";
    };

    const deleteCookie = (name) => {
        setCookie(name, "", -1);
    };

    // 初始化时从Cookie读取数据
    const loadFromCookie = () => {
        try {
            const cookieData = getCookie(COOKIE_NAME);
            if (cookieData) {
                fsData = JSON.parse(cookieData);
                console.log('从Cookie加载文件系统数据成功');
            } else {
                fsData = {};
                console.log('Cookie中没有找到文件系统数据，使用空对象');
            }
        } catch (e) {
            console.error('从Cookie加载数据失败:', e);
            fsData = {};
        }
    };

    // 保存数据到Cookie
    const saveToCookie = () => {
        try {
            setCookie(COOKIE_NAME, fsData, COOKIE_EXPIRY_DAYS);
        } catch (e) {
            console.error('保存到Cookie失败:', e);
        }
    };

    // 初始化时加载Cookie数据
    loadFromCookie();

    // ========== 核心工具函数 ==========
    const getProjectId = () => {
        try {
            if (Scratch && Scratch.vm && Scratch.vm.project && Scratch.vm.project.id) {
                currentProjectId = Scratch.vm.project.id;
            } else if (window.scratchVM && window.scratchVM.project && window.scratchVM.project.id) {
                currentProjectId = window.scratchVM.project.id;
            }
            return currentProjectId;
        } catch (e) {
            return currentProjectId;
        }
    };

    const initProjectFS = (projectId) => {
        if (!projectId) projectId = getProjectId();
        if (!fsData[projectId]) {
            fsData[projectId] = {
                exists: false,
                currentDir: 'S:/',
                fs: {
                    'S:/': {
                        type: 'dir',
                        children: [],
                        files: {},
                        dirs: {}
                    }
                }
            };
            saveToCookie();
        }
        return fsData[projectId];
    };

    const parsePath = (projectId, inputPath) => {
        const projectFS = initProjectFS(projectId);
        let targetPath = inputPath.trim().replace(/\\/g, '/');
        if (targetPath === 'S:' || targetPath === 'S:/') return 'S:/';
        if (!targetPath.startsWith('S:/')) {
            targetPath = projectFS.currentDir.endsWith('/') 
                ? projectFS.currentDir + targetPath 
                : projectFS.currentDir + '/' + targetPath;
        }
        const segments = targetPath.replace('S:/', '').split('/').filter(seg => seg);
        const resolved = [];
        for (const seg of segments) {
            if (seg === '..' && resolved.length > 0) {
                resolved.pop();
            } else if (seg !== '.' && seg !== '..') {
                resolved.push(seg);
            }
        }
        return 'S:/' + resolved.join('/');
    };

    const getDirMeta = (projectId, dirPath) => {
        const projectFS = initProjectFS(projectId);
        dirPath = parsePath(projectId, dirPath);
        let currentNode = projectFS.fs['S:/'];
        const pathSegments = dirPath.replace('S:/', '').split('/').filter(seg => seg);
        for (const seg of pathSegments) {
            if (currentNode.dirs && currentNode.dirs[seg]) {
                currentNode = currentNode.dirs[seg];
            } else {
                return null;
            }
        }
        return currentNode;
    };

    // ========== 导入导出函数 ==========
    const exportFileSystem = () => {
        try {
            const projectId = getProjectId();
            const projectFS = initProjectFS(projectId);
            
            if (!projectFS.exists) {
                return '{"error": "当前作品没有创建文件系统"}';
            }
            
            // 导出当前项目的文件系统数据
            const exportData = {
                projectId: projectId,
                exists: projectFS.exists,
                currentDir: projectFS.currentDir,
                fs: projectFS.fs
            };
            
            // 转换为JSON字符串并返回
            return JSON.stringify(exportData);
        } catch (e) {
            console.error('导出失败:', e);
            return `{"error": "导出文件系统失败：${e.message}"}`;
        }
    };

    const importFileSystem = (jsonData) => {
        try {
            if (!jsonData || jsonData.trim() === '') {
                return false;
            }
            
            const projectId = getProjectId();
            
            // 尝试解析JSON数据
            let importData;
            try {
                importData = JSON.parse(jsonData);
            } catch (e) {
                try {
                    const decoded = decodeURIComponent(jsonData);
                    importData = JSON.parse(decoded);
                } catch (e2) {
                    throw new Error('无法解析JSON数据，请确保格式正确');
                }
            }
            
            // 验证导入数据格式
            if (!importData.fs || !importData.fs['S:/']) {
                throw new Error('导入的数据格式不正确，缺少文件系统结构');
            }
            
            // 确保项目存在
            initProjectFS(projectId);
            
            // 导入数据
            fsData[projectId] = {
                exists: importData.exists !== undefined ? importData.exists : true,
                currentDir: importData.currentDir || 'S:/',
                fs: importData.fs
            };
            
            // 保存到Cookie
            saveToCookie();
            
            // 如果文件管理器已打开，刷新显示
            if (fileManagerWindow && document.body.contains(fileManagerWindow)) {
                renderFileList(projectId);
                updateStatus(projectId, '文件系统已成功导入');
            }
            
            return true;
        } catch (e) {
            console.error('导入失败:', e);
            return false;
        }
    };

    // ========== 文件管理器核心 ==========
    const createFileManager = (projectId) => {
        if (fileManagerWindow && document.body.contains(fileManagerWindow)) {
            fileManagerWindow.style.display = 'flex';
            renderFileList(projectId);
            return;
        }

        const projectFS = initProjectFS(projectId);
        if (!projectFS.exists) {
            alert('请先创建文件系统！\n使用"为当前作品创建文件系统"积木');
            return;
        }

        // 清除旧窗口
        if (fileManagerWindow) {
            document.body.removeChild(fileManagerWindow);
            fileManagerWindow = null;
        }

        // 创建窗口
        fileManagerWindow = document.createElement('div');
        const windowId = `sf-file-manager-${projectId}`;
        fileManagerWindow.id = windowId;
        fileManagerWindow.style.cssText = `
            position: fixed; top: 50px; left: 50px; width: 850px; height: 550px;
            background: white; border: 3px solid #ff9500; border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.3); z-index: 10000;
            display: flex; flex-direction: column; font-family: Arial, sans-serif;
            cursor: default;
        `;

        // 标题栏（可拖动区域）
        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            padding: 12px 16px; background: linear-gradient(135deg, #ff9500, #ff6b00);
            color: white; font-weight: bold; font-size: 16px;
            display: flex; justify-content: space-between; align-items: center;
            cursor: move; user-select: none; border-radius: 10px 10px 0 0;
        `;
        titleBar.innerHTML = `
            <div>📁 SF文件管理器 - 只读模式 (盘符 S:)</div>
            <button id="sf-close-btn-${projectId}" style="
                background: #ff4444; color: white; border: none; 
                width: 30px; height: 30px; border-radius: 50%;
                font-size: 18px; cursor: pointer; display: flex;
                align-items: center; justify-content: center;
                flex-shrink: 0;
            ">×</button>
        `;

        // 工具栏
        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            padding: 10px 16px; background: #f5f5f5; 
            display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
            border-bottom: 1px solid #ddd;
        `;

        // 创建路径标签
        const pathLabel = document.createElement('span');
        pathLabel.style.cssText = `font-weight: bold; color: #555; white-space: nowrap;`;
        pathLabel.textContent = '路径:';
        toolbar.appendChild(pathLabel);

        // 创建路径输入框
        const pathInput = document.createElement('input');
        pathInput.id = `sf-path-input-${projectId}`;
        pathInput.type = 'text';
        pathInput.value = projectFS.currentDir;
        pathInput.style.cssText = `
            flex: 1; min-width: 200px; padding: 8px 12px; 
            border: 2px solid #ccc; border-radius: 6px; font-size: 14px;
        `;
        toolbar.appendChild(pathInput);

        // 创建刷新按钮
        const refreshBtn = document.createElement('button');
        refreshBtn.id = `sf-refresh-btn-${projectId}`;
        refreshBtn.innerHTML = '🔄 刷新';
        refreshBtn.style.cssText = `
            padding: 8px 16px; background: #FF9800; color: white;
            border: none; border-radius: 6px; cursor: pointer; font-weight: bold;
            white-space: nowrap; display: flex; align-items: center; gap: 5px;
        `;
        toolbar.appendChild(refreshBtn);

        // 创建跳转按钮
        const goBtn = document.createElement('button');
        goBtn.id = `sf-go-btn-${projectId}`;
        goBtn.textContent = '📂 跳转';
        goBtn.style.cssText = `
            padding: 8px 16px; background: #4CAF50; color: white;
            border: none; border-radius: 6px; cursor: pointer; font-weight: bold;
            white-space: nowrap;
        `;
        toolbar.appendChild(goBtn);

        // 创建上级按钮
        const upBtn = document.createElement('button');
        upBtn.id = `sf-up-btn-${projectId}`;
        upBtn.textContent = '⬆ 上级';
        upBtn.style.cssText = `
            padding: 8px 16px; background: #2196F3; color: white;
            border: none; border-radius: 6px; cursor: pointer;
            white-space: nowrap;
        `;
        toolbar.appendChild(upBtn);

        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.id = `sf-delete-btn-${projectId}`;
        deleteBtn.innerHTML = '🗑️ 删除选中项';
        deleteBtn.style.cssText = `
            padding: 8px 16px; background: #f44336; color: white;
            border: none; border-radius: 6px; cursor: pointer; font-weight: bold;
            white-space: nowrap; display: flex; align-items: center; gap: 5px;
        `;
        toolbar.appendChild(deleteBtn);

        // 创建选中信息显示
        const selectedInfo = document.createElement('span');
        selectedInfo.id = `sf-selected-info-${projectId}`;
        selectedInfo.style.cssText = `color: #666; font-size: 13px; margin-left: auto; white-space: nowrap;`;
        selectedInfo.textContent = '未选中任何项目';
        toolbar.appendChild(selectedInfo);

        // 文件列表容器
        const listContainer = document.createElement('div');
        listContainer.style.cssText = `
            flex: 1; display: flex; flex-direction: column; 
            background: white; overflow: hidden;
        `;
        
        const listHeader = document.createElement('div');
        listHeader.style.cssText = `
            padding: 12px 16px; background: #e9e9e9; 
            font-weight: bold; color: #333; border-bottom: 2px solid #ddd;
            display: grid; grid-template-columns: 1fr 100px 150px;
        `;
        listHeader.innerHTML = '<div>名称</div><div>类型</div><div>大小</div>';
        
        const fileList = document.createElement('div');
        fileList.id = `sf-file-list-${projectId}`;
        fileList.style.cssText = `
            flex: 1; overflow-y: auto; overflow-x: hidden;
            background: #fafafa;
        `;
        
        listContainer.appendChild(listHeader);
        listContainer.appendChild(fileList);

        // 状态栏
        const statusBar = document.createElement('div');
        statusBar.id = `sf-status-bar-${projectId}`;
        statusBar.style.cssText = `
            padding: 10px 16px; background: #e0e0e0;
            border-top: 1px solid #ccc; font-size: 13px; color: #555;
            display: flex; justify-content: space-between;
        `;
        statusBar.innerHTML = `
            <span>提示: 单击选中，双击查看内容</span>
            <span>总容量: ∞</span>
        `;

        // 组装界面
        fileManagerWindow.appendChild(titleBar);
        fileManagerWindow.appendChild(toolbar);
        fileManagerWindow.appendChild(listContainer);
        fileManagerWindow.appendChild(statusBar);
        document.body.appendChild(fileManagerWindow);

        // 初始化选中状态
        selectedItem = null;

        // 渲染初始列表
        renderFileList(projectId);

        // ========== 事件绑定 ==========
        // 窗口拖动功能
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            windowStartX = fileManagerWindow.offsetLeft;
            windowStartY = fileManagerWindow.offsetTop;
            
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag);
        });

        const handleDrag = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            
            let newX = windowStartX + deltaX;
            let newY = windowStartY + deltaY;
            
            const maxX = window.innerWidth - fileManagerWindow.offsetWidth;
            const maxY = window.innerHeight - fileManagerWindow.offsetHeight;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            fileManagerWindow.style.left = `${newX}px`;
            fileManagerWindow.style.top = `${newY}px`;
        };

        const stopDrag = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };

        // 刷新按钮
        refreshBtn.addEventListener('click', () => {
            renderFileList(projectId);
            updateStatus(projectId, '已刷新文件列表');
        });
        
        // 关闭按钮
        document.getElementById(`sf-close-btn-${projectId}`).addEventListener('click', () => {
            if (fileManagerWindow && document.body.contains(fileManagerWindow)) {
                document.body.removeChild(fileManagerWindow);
                fileManagerWindow = null;
                selectedItem = null;
            }
        });
        
        // 跳转按钮
        goBtn.addEventListener('click', () => {
            const pathInput = document.getElementById(`sf-path-input-${projectId}`);
            navigateToDir(projectId, pathInput.value);
            renderFileList(projectId);
            clearSelection(projectId);
        });
        
        // 上级按钮
        upBtn.addEventListener('click', () => {
            const currentPath = fsData[projectId].currentDir;
            if (currentPath !== 'S:/') {
                const pathSegments = currentPath.replace('S:/', '').split('/').filter(seg => seg);
                pathSegments.pop();
                const newPath = 'S:/' + (pathSegments.length ? pathSegments.join('/') : '');
                navigateToDir(projectId, newPath);
                renderFileList(projectId);
                clearSelection(projectId);
            }
        });
        
        // 删除按钮
        deleteBtn.addEventListener('click', () => {
            if (!selectedItem) {
                alert('请先选择一个文件或文件夹！');
                return;
            }
            
            const itemName = selectedItem.name;
            const itemType = selectedItem.type;
            const typeName = itemType === 'dir' ? '文件夹' : '文件';
            
            if (confirm(`确定要删除${typeName} "${itemName}" 吗？\n此操作不可撤销！`)) {
                try {
                    deleteItem(projectId, fsData[projectId].currentDir, itemName);
                    renderFileList(projectId);
                    updateStatus(projectId, `已删除: ${itemName}`);
                    clearSelection(projectId);
                } catch (e) {
                    alert('删除失败: ' + e.message);
                }
            }
        });
        
        // 路径输入框回车键
        pathInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                navigateToDir(projectId, pathInput.value);
                renderFileList(projectId);
                clearSelection(projectId);
            }
        });
        
        // 单击事件 - 选中项目
        fileList.addEventListener('click', (e) => {
            const item = e.target.closest('.sf-item');
            if (!item) return;
            
            const itemName = item.dataset.name;
            const itemType = item.dataset.type;
            
            if (itemType === 'dir' && itemName === '..') {
                const currentPath = fsData[projectId].currentDir;
                if (currentPath !== 'S:/') {
                    const pathSegments = currentPath.replace('S:/', '').split('/').filter(seg => seg);
                    pathSegments.pop();
                    const newPath = 'S:/' + (pathSegments.length ? pathSegments.join('/') : '');
                    navigateToDir(projectId, newPath);
                    renderFileList(projectId);
                    clearSelection(projectId);
                }
                return;
            }
            
            fileList.querySelectorAll('.sf-item').forEach(el => {
                el.classList.remove('selected');
            });
            
            item.classList.add('selected');
            selectedItem = { name: itemName, type: itemType };
            updateSelectedInfo(projectId, itemName, itemType);
        });
        
        // 双击事件 - 打开内容或进入文件夹
        fileList.addEventListener('dblclick', (e) => {
            const item = e.target.closest('.sf-item');
            if (!item) return;
            
            const itemName = item.dataset.name;
            const itemType = item.dataset.type;
            
            if (itemType === 'file') {
                const currentPath = fsData[projectId].currentDir;
                const content = readFileContentSync(projectId, currentPath, itemName);
                
                if (content !== null) {
                    showFileContentWithCustomModal(itemName, String(content));
                } else {
                    alert(`无法读取文件: ${itemName}`);
                }
            } else if (itemType === 'dir' && itemName !== '..') {
                const currentPath = fsData[projectId].currentDir;
                const newPath = currentPath.endsWith('/') 
                    ? currentPath + itemName 
                    : currentPath + '/' + itemName;
                navigateToDir(projectId, newPath);
                renderFileList(projectId);
                clearSelection(projectId);
            }
        });

        // 右键菜单 - 删除
        fileList.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const item = e.target.closest('.sf-item');
            if (!item || item.dataset.name === '..') return;
            
            const itemName = item.dataset.name;
            const itemType = item.dataset.type;
            
            fileList.querySelectorAll('.sf-item').forEach(el => {
                el.classList.remove('selected');
            });
            item.classList.add('selected');
            selectedItem = { name: itemName, type: itemType };
            updateSelectedInfo(projectId, itemName, itemType);
            
            const typeName = itemType === 'dir' ? '文件夹' : '文件';
            if (confirm(`删除${typeName} "${itemName}"？`)) {
                deleteItem(projectId, fsData[projectId].currentDir, itemName);
                renderFileList(projectId);
                updateStatus(projectId, `已删除: ${itemName}`);
                clearSelection(projectId);
            }
        });
        
        // F5快捷键刷新
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' && fileManagerWindow && fileManagerWindow.style.display !== 'none') {
                e.preventDefault();
                renderFileList(projectId);
                updateStatus(projectId, '已刷新文件列表 (F5)');
            }
        });
    };

    // 使用自定义弹窗显示文件内容（黑色文字）
    const showFileContentWithCustomModal = (fileName, content) => {
        const existingModal = document.querySelector('.sf-file-content-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        const maxLength = 5000;
        let displayContent = content;
        let isTruncated = false;
        
        if (content.length > maxLength) {
            displayContent = content.substring(0, maxLength) + 
                `\n\n...（内容已截断，完整内容 ${content.length} 字符，此处显示前 ${maxLength} 字符）`;
            isTruncated = true;
        }
        
        const modal = document.createElement('div');
        modal.className = 'sf-file-content-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 10001;
            display: flex; justify-content: center; align-items: center;
        `;
        
        const contentBox = document.createElement('div');
        contentBox.style.cssText = `
            background: white; width: 700px; height: 500px;
            border-radius: 10px; overflow: hidden; box-shadow: 0 5px 25px rgba(0,0,0,0.3);
            display: flex; flex-direction: column;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 15px 20px; background: #2196F3; color: white;
            font-weight: bold; font-size: 16px; display: flex;
            justify-content: space-between; align-items: center;
        `;
        header.innerHTML = `
            <span>📄 查看文件: ${fileName}</span>
            <button id="sf-close-content-btn" style="
                background: none; border: none; color: white;
                font-size: 24px; cursor: pointer; padding: 0;
                line-height: 1;
            ">×</button>
        `;
        
        const contentArea = document.createElement('textarea');
        contentArea.style.cssText = `
            flex: 1; padding: 15px; margin: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px; line-height: 1.4;
            background: #f8f8f8; color: #000000;
            border: none; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;
            resize: none; outline: none; white-space: pre; overflow-wrap: normal;
            overflow-x: auto;
        `;
        contentArea.value = displayContent;
        contentArea.readOnly = true;
        
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 12px 20px; background: #f5f5f5;
            display: flex; justify-content: space-between; align-items: center;
            font-size: 12px; color: #666;
        `;
        
        const infoText = document.createElement('div');
        infoText.innerHTML = `
            <div>字符数: ${content.length}${isTruncated ? ` (显示前 ${maxLength} 字符)` : ''}</div>
            <div>提示: 按 Ctrl+A 全选，Ctrl+C 复制内容</div>
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.cssText = `
            padding: 8px 20px; background: #2196F3; color: white;
            border: none; border-radius: 5px; cursor: pointer; font-weight: bold;
        `;
        
        footer.appendChild(infoText);
        footer.appendChild(closeBtn);
        
        contentBox.appendChild(header);
        contentBox.appendChild(contentArea);
        contentBox.appendChild(footer);
        modal.appendChild(contentBox);
        document.body.appendChild(modal);
        
        const closeContentBtn = document.getElementById('sf-close-content-btn');
        
        const closeModal = () => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        };
        
        closeBtn.addEventListener('click', closeModal);
        closeContentBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        setTimeout(() => {
            contentArea.focus();
            contentArea.select();
        }, 100);
    };

    // 清除选中状态
    const clearSelection = (projectId) => {
        const fileList = document.getElementById(`sf-file-list-${projectId}`);
        if (fileList) {
            fileList.querySelectorAll('.sf-item').forEach(el => {
                el.classList.remove('selected');
            });
        }
        selectedItem = null;
        const selectedInfo = document.getElementById(`sf-selected-info-${projectId}`);
        if (selectedInfo) {
            selectedInfo.textContent = '未选中任何项目';
            selectedInfo.style.color = '#666';
        }
    };

    // 更新选中信息显示
    const updateSelectedInfo = (projectId, itemName, itemType) => {
        const selectedInfo = document.getElementById(`sf-selected-info-${projectId}`);
        if (selectedInfo) {
            const typeName = itemType === 'dir' ? '文件夹' : '文件';
            selectedInfo.textContent = `已选中: ${itemName} (${typeName})`;
            selectedInfo.style.color = '#2196F3';
        }
    };

    // 同步读取文件内容
    const readFileContentSync = (projectId, dirPath, itemName) => {
        try {
            const projectFS = initProjectFS(projectId);
            dirPath = parsePath(projectId, dirPath);
            const dirMeta = getDirMeta(projectId, dirPath);
            
            if (!dirMeta || !dirMeta.files) {
                return null;
            }
            
            if (!dirMeta.files[itemName]) {
                return null;
            }
            
            const fileData = dirMeta.files[itemName];
            const content = fileData.content;
            
            if (content === undefined || content === null) {
                return '';
            }
            
            return String(content);
        } catch (e) {
            console.error('读取文件失败:', e);
            return null;
        }
    };

    // 渲染文件列表
    const renderFileList = (projectId) => {
        const fileList = document.getElementById(`sf-file-list-${projectId}`);
        const statusBar = document.getElementById(`sf-status-bar-${projectId}`);
        const pathInput = document.getElementById(`sf-path-input-${projectId}`);
        
        if (!fileList) return;
        
        const projectFS = initProjectFS(projectId);
        const currentDirMeta = getDirMeta(projectId, projectFS.currentDir);
        
        if (!currentDirMeta) {
            fileList.innerHTML = '<div class="sf-error">目录不存在</div>';
            updateStatus(projectId, '错误: 目录不存在');
            return;
        }
        
        if (pathInput) {
            pathInput.value = projectFS.currentDir;
        }
        
        let html = '';
        const dirs = Object.keys(currentDirMeta.dirs || {}).sort();
        const files = Object.keys(currentDirMeta.files || {}).sort();
        
        if (projectFS.currentDir !== 'S:/') {
            html += `
                <div class="sf-item" data-type="dir" data-name="..">
                    <div class="sf-item-name">📁 [上级目录]</div>
                    <div class="sf-item-type">文件夹</div>
                    <div class="sf-item-size">--</div>
                </div>
            `;
        }
        
        dirs.forEach(dir => {
            const dirData = currentDirMeta.dirs[dir];
            const itemCount = (dirData.children || []).length;
            
            html += `
                <div class="sf-item" data-type="dir" data-name="${dir}">
                    <div class="sf-item-name">📁 ${dir}</div>
                    <div class="sf-item-type">文件夹</div>
                    <div class="sf-item-size">${itemCount} 个项目</div>
                </div>
            `;
        });
        
        files.forEach(file => {
            const fileData = currentDirMeta.files[file];
            const content = fileData?.content || '';
            const size = new Blob([String(content)]).size;
            const sizeText = formatFileSize(size);
            
            html += `
                <div class="sf-item" data-type="file" data-name="${file}">
                    <div class="sf-item-name">📄 ${file}</div>
                    <div class="sf-item-type">文件</div>
                    <div class="sf-item-size">${sizeText}</div>
                </div>
            `;
        });
        
        if (dirs.length === 0 && files.length === 0 && projectFS.currentDir === 'S:/') {
            html = '<div class="sf-empty">📂 根目录为空<br><small>使用积木创建文件和文件夹</small></div>';
        }
        
        fileList.innerHTML = html;
        
        if (!document.querySelector('#sf-file-list-style')) {
            const style = document.createElement('style');
            style.id = 'sf-file-list-style';
            style.textContent = `
                .sf-item {
                    padding: 10px 16px;
                    border-bottom: 1px solid #eee;
                    display: grid;
                    grid-template-columns: 1fr 100px 150px;
                    cursor: pointer;
                    transition: all 0.2s;
                    align-items: center;
                }
                .sf-item:hover {
                    background-color: #f0f7ff;
                }
                .sf-item.selected {
                    background-color: #e3f2fd !important;
                    border-left: 4px solid #2196F3;
                    font-weight: 500;
                }
                .sf-item-name {
                    font-weight: 500;
                    color: #333;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .sf-item-type {
                    color: #666;
                    font-size: 13px;
                }
                .sf-item-size {
                    color: #888;
                    font-size: 13px;
                    text-align: right;
                }
                .sf-empty {
                    padding: 60px 20px;
                    text-align: center;
                    color: #999;
                    font-style: italic;
                    line-height: 1.6;
                }
                .sf-error {
                    padding: 40px 20px;
                    text-align: center;
                    color: #f44336;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }
        
        updateStatus(projectId, `单击选中，双击查看 (F5刷新) | 路径: ${projectFS.currentDir} | 文件夹: ${dirs.length} | 文件: ${files.length}`);
    };

    // 更新状态栏
    const updateStatus = (projectId, message) => {
        const statusBar = document.getElementById(`sf-status-bar-${projectId}`);
        if (statusBar) {
            statusBar.innerHTML = `<span>${message}</span><span>总容量: ∞</span>`;
        }
    };

    // 格式化文件大小
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // ========== 核心功能函数 ==========
    const hasFS = () => {
        const projectId = getProjectId();
        initProjectFS(projectId);
        return !!fsData[projectId].exists;
    };

    const createFS = () => {
        const projectId = getProjectId();
        const projectFS = initProjectFS(projectId);
        if (projectFS.exists) {
            alert('当前作品已创建过文件系统！');
            return;
        }
        projectFS.exists = true;
        saveToCookie();
        alert('文件系统创建成功！盘符: S:\n请使用积木创建文件和文件夹');
    };

    const openFileManager = () => {
        const projectId = getProjectId();
        createFileManager(projectId);
    };

    const closeFileManager = () => {
        if (fileManagerWindow && document.body.contains(fileManagerWindow)) {
            document.body.removeChild(fileManagerWindow);
            fileManagerWindow = null;
            selectedItem = null;
        }
    };

    const getCurrentDir = () => {
        const projectId = getProjectId();
        initProjectFS(projectId);
        return fsData[projectId].currentDir;
    };

    const getCurrentDirItems = () => {
        const projectId = getProjectId();
        const projectFS = initProjectFS(projectId);
        const currentDirMeta = getDirMeta(projectId, projectFS.currentDir);
        if (!currentDirMeta) return '[]';
        const items = [
            ...Object.keys(currentDirMeta.dirs || {}),
            ...Object.keys(currentDirMeta.files || {})
        ];
        return JSON.stringify(items);
    };

    const navigateToDir = (projectId, dirPath) => {
        projectId = projectId || getProjectId();
        const projectFS = initProjectFS(projectId);
        const targetPath = parsePath(projectId, dirPath);
        const dirMeta = getDirMeta(projectId, targetPath);
        
        if (dirMeta && dirMeta.type === 'dir') {
            projectFS.currentDir = targetPath;
            saveToCookie();
            return true;
        } else {
            alert(`目录不存在: ${targetPath}`);
            return false;
        }
    };

    const searchItem = (searchName) => {
        if (!searchName) return '[]';
        const projectId = getProjectId();
        const projectFS = initProjectFS(projectId);
        const results = [];

        const searchRecursive = (currentPath, currentNode) => {
            Object.keys(currentNode.dirs || {}).forEach(dirName => {
                const fullPath = currentPath.endsWith('/') ? currentPath + dirName : currentPath + '/' + dirName;
                if (dirName.includes(searchName)) results.push(fullPath);
                searchRecursive(fullPath, currentNode.dirs[dirName]);
            });
            Object.keys(currentNode.files || {}).forEach(fileName => {
                const fullPath = currentPath.endsWith('/') ? currentPath + fileName : currentPath + '/' + fileName;
                if (fileName.includes(searchName)) results.push(fullPath);
            });
        };

        searchRecursive('S:/', projectFS.fs['S:/']);
        return JSON.stringify(results);
    };

    const saveContentToDir = (projectId, dirPath, fileName, ext, content) => {
        projectId = projectId || getProjectId();
        const projectFS = initProjectFS(projectId);
        
        if (!projectFS.exists) {
            throw new Error('请先创建文件系统');
        }
        
        dirPath = parsePath(projectId, dirPath);
        const dirMeta = getDirMeta(projectId, dirPath);

        if (!dirMeta) {
            throw new Error(`目录不存在: ${dirPath}`);
        }

        let fullFileName;
        if (fileName.includes('.')) {
            fullFileName = fileName;
        } else if (ext) {
            fullFileName = `${fileName}.${ext}`;
        } else {
            fullFileName = `${fileName}`;
        }

        if (dirMeta.files && dirMeta.files[fullFileName]) {
            throw new Error(`文件已存在: ${fullFileName}`);
        }

        if (!dirMeta.files) dirMeta.files = {};
        dirMeta.files[fullFileName] = { 
            type: 'file', 
            content: String(content || ''),
            created: new Date().toISOString()
        };
        
        if (!dirMeta.children) dirMeta.children = [];
        dirMeta.children.push(fullFileName);
        
        saveToCookie();
        return true;
    };

    const newFolderToDir = (projectId, dirPath, folderName) => {
        projectId = projectId || getProjectId();
        const projectFS = initProjectFS(projectId);
        
        if (!projectFS.exists) {
            throw new Error('请先创建文件系统');
        }
        
        if (!folderName) {
            throw new Error('文件夹名称不能为空');
        }
        
        dirPath = parsePath(projectId, dirPath);
        const dirMeta = getDirMeta(projectId, dirPath);

        if (!dirMeta) {
            throw new Error(`目录不存在: ${dirPath}`);
        }
        
        if (dirMeta.dirs && dirMeta.dirs[folderName]) {
            throw new Error(`文件夹已存在: ${folderName}`);
        }

        if (!dirMeta.dirs) dirMeta.dirs = {};
        dirMeta.dirs[folderName] = { 
            type: 'dir', 
            children: [], 
            files: {}, 
            dirs: {},
            created: new Date().toISOString()
        };
        
        if (!dirMeta.children) dirMeta.children = [];
        dirMeta.children.push(folderName);
        
        saveToCookie();
        return true;
    };

    const readFileContent = (projectId, dirPath, itemName) => {
        try {
            projectId = projectId || getProjectId();
            const projectFS = initProjectFS(projectId);
            
            if (!projectFS.exists) {
                return '请先创建文件系统';
            }
            
            dirPath = parsePath(projectId, dirPath);
            const dirMeta = getDirMeta(projectId, dirPath);

            if (!dirMeta) {
                return `目录不存在: ${dirPath}`;
            }

            if (dirMeta.files && dirMeta.files[itemName]) {
                return dirMeta.files[itemName].content || '';
            }
            
            if (dirMeta.dirs && dirMeta.dirs[itemName]) {
                const subDir = dirMeta.dirs[itemName];
                const items = [
                    ...Object.keys(subDir.dirs || {}),
                    ...Object.keys(subDir.files || {})
                ];
                return `[文件夹] ${itemName} (包含 ${items.length} 个项目)`;
            }
            
            return `未找到: ${itemName}`;
        } catch (e) {
            console.error('读取失败:', e);
            return '读取文件失败';
        }
    };

    const modifyFileContent = (projectId, dirPath, fileName, newContent) => {
        projectId = projectId || getProjectId();
        const projectFS = initProjectFS(projectId);
        
        if (!projectFS.exists) {
            throw new Error('请先创建文件系统');
        }
        
        dirPath = parsePath(projectId, dirPath);
        const dirMeta = getDirMeta(projectId, dirPath);

        if (!dirMeta) {
            throw new Error(`目录不存在: ${dirPath}`);
        }
        
        if (!dirMeta.files || !dirMeta.files[fileName]) {
            throw new Error(`文件不存在: ${fileName}`);
        }

        dirMeta.files[fileName].content = String(newContent);
        dirMeta.files[fileName].modified = new Date().toISOString();
        saveToCookie();
        return true;
    };

    const deleteItem = (projectId, dirPath, itemName) => {
        projectId = projectId || getProjectId();
        const projectFS = initProjectFS(projectId);
        
        if (!projectFS.exists) {
            throw new Error('请先创建文件系统');
        }
        
        dirPath = parsePath(projectId, dirPath);
        const dirMeta = getDirMeta(projectId, dirPath);

        if (!dirMeta) {
            throw new Error(`目录不存在: ${dirPath}`);
        }

        let deleted = false;
        
        if (dirMeta.dirs && dirMeta.dirs[itemName]) {
            delete dirMeta.dirs[itemName];
            deleted = true;
        } else if (dirMeta.files && dirMeta.files[itemName]) {
            delete dirMeta.files[itemName];
            deleted = true;
        }
        
        if (deleted && dirMeta.children) {
            dirMeta.children = dirMeta.children.filter(item => item !== itemName);
            saveToCookie();
            return true;
        }
        
        throw new Error(`未找到项目: ${itemName}`);
    };

    // ========== 拓展注册 ==========
    class SFFileSystem {
        getInfo() {
            return {
                id: EXTENSION_ID,
                name: 'SF文件系统',
                color1: '#ff9500',
                color2: '#e68a00',
                color3: '#cc7a00',
                blocks: [
                    { 
                        opcode: 'hasFileSystem', 
                        blockType: Scratch.BlockType.BOOLEAN, 
                        text: '当前作品是否已创建文件系统', 
                        func: 'hasFileSystem' 
                    },
                    { 
                        opcode: 'createFileSystem', 
                        blockType: Scratch.BlockType.COMMAND, 
                        text: '为当前作品创建文件系统（盘符S:）', 
                        func: 'createFileSystem' 
                    },
                    { 
                        opcode: 'openFileManager', 
                        blockType: Scratch.BlockType.COMMAND, 
                        text: '打开文件管理器（只读模式）', 
                        func: 'openFileManager' 
                    },
                    { 
                        opcode: 'closeFileManager', 
                        blockType: Scratch.BlockType.COMMAND, 
                        text: '关闭文件管理器', 
                        func: 'closeFileManager' 
                    },
                    { 
                        opcode: 'getCurrentDirectory', 
                        blockType: Scratch.BlockType.REPORTER, 
                        text: '当前所在目录', 
                        func: 'getCurrentDirectory' 
                    },
                    { 
                        opcode: 'getCurrentDirItems', 
                        blockType: Scratch.BlockType.REPORTER, 
                        text: '当前路径内存在的文件夹&文件', 
                        func: 'getCurrentDirItems' 
                    },
                    { 
                        opcode: 'navigateToDirectory', 
                        blockType: Scratch.BlockType.COMMAND, 
                        text: '导航到目录 [DIR]',
                        arguments: { 
                            DIR: { 
                                type: Scratch.ArgumentType.STRING, 
                                defaultValue: 'S:/' 
                            } 
                        },
                        func: 'navigateToDirectory' 
                    },
                    { 
                        opcode: 'searchItemPath', 
                        blockType: Scratch.BlockType.REPORTER,
                        text: '搜索 [NAME] 所在目录',
                        arguments: { 
                            NAME: { 
                                type: Scratch.ArgumentType.STRING, 
                                defaultValue: '文件1' 
                            } 
                        },
                        func: 'searchItemPath' 
                    },
                    { 
                        opcode: 'saveContentToDirectory', 
                        blockType: Scratch.BlockType.COMMAND,
                        text: '将内容 [CONTENT] 保存到 [DIR] 目录下命名为 [NAME] 后缀名 [EXT]',
                        arguments: {
                            CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: '测试内容' },
                            DIR: { type: Scratch.ArgumentType.STRING, defaultValue: 'S:/' },
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文件1' },
                            EXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'txt' }
                        },
                        func: 'saveContentToDirectory'
                    },
                    { 
                        opcode: 'newFolderToDirectory', 
                        blockType: Scratch.BlockType.COMMAND,
                        text: '新建文件夹 [NAME] 到目录 [DIR] 下',
                        arguments: {
                            NAME: { type: Scratch.ArgumentType.STRING, defaultValue: '文件夹1' },
                            DIR: { type: Scratch.ArgumentType.STRING, defaultValue: 'S:/' }
                        },
                        func: 'newFolderToDirectory'
                    },
                    { 
                        opcode: 'readItemContent', 
                        blockType: Scratch.BlockType.REPORTER,
                        text: '读取目录 [DIR] 下 [ITEM] 的内容',
                        arguments: {
                            DIR: { type: Scratch.ArgumentType.STRING, defaultValue: 'S:/' },
                            ITEM: { type: Scratch.ArgumentType.STRING, defaultValue: '文件1.txt' }
                        },
                        func: 'readItemContent'
                    },
                    { 
                        opcode: 'modifyFileContent', 
                        blockType: Scratch.BlockType.COMMAND,
                        text: '修改目录 [DIR] 中的 [FILE] 文件内容为 [CONTENT]',
                        arguments: {
                            DIR: { type: Scratch.ArgumentType.STRING, defaultValue: 'S:/' },
                            FILE: { type: Scratch.ArgumentType.STRING, defaultValue: '文件1.txt' },
                            CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: '新内容' }
                        },
                        func: 'modifyFileContent'
                    },
                    { 
                        opcode: 'deleteItemFromDir', 
                        blockType: Scratch.BlockType.COMMAND,
                        text: '删除目录 [DIR] 下的 [ITEM]',
                        arguments: {
                            DIR: { type: Scratch.ArgumentType.STRING, defaultValue: 'S:/' },
                            ITEM: { type: Scratch.ArgumentType.STRING, defaultValue: '文件1.txt' }
                        },
                        func: 'deleteItemFromDir'
                    },
                    // ========== 新增积木 ==========
                    { 
                        opcode: 'exportFileSystem', 
                        blockType: Scratch.BlockType.REPORTER,
                        text: '导出文件系统（返回JSON数据）',
                        func: 'exportFileSystem'
                    },
                    { 
                        opcode: 'importFileSystemFromJson', 
                        blockType: Scratch.BlockType.COMMAND,
                        text: '从 [JSON] 导入文件系统',
                        arguments: {
                            JSON: { 
                                type: Scratch.ArgumentType.STRING, 
                                defaultValue: '{"exists":true,"currentDir":"S:/","fs":{"S:/":{"type":"dir","children":[],"files":{},"dirs":{}}}}'
                            }
                        },
                        func: 'importFileSystemFromJson'
                    }
                ]
            };
        }

        hasFileSystem() { return hasFS(); }
        createFileSystem() { createFS(); }
        openFileManager() { openFileManager(); }
        closeFileManager() { closeFileManager(); }
        getCurrentDirectory() { return getCurrentDir(); }
        getCurrentDirItems() { return getCurrentDirItems(); }
        navigateToDirectory(args) { navigateToDir(null, args.DIR); }
        searchItemPath(args) { return searchItem(args.NAME); }
        saveContentToDirectory(args) { saveContentToDir(null, args.DIR, args.NAME, args.EXT, args.CONTENT); }
        newFolderToDirectory(args) { newFolderToDir(null, args.DIR, args.NAME); }
        readItemContent(args) { return readFileContent(null, args.DIR, args.ITEM); }
        modifyFileContent(args) { modifyFileContent(null, args.DIR, args.FILE, args.CONTENT); }
        deleteItemFromDir(args) { deleteItem(null, args.DIR, args.ITEM); }
        // 新增积木的方法
        exportFileSystem() { return exportFileSystem(); }
        importFileSystemFromJson(args) { importFileSystem(args.JSON); }
    }

    if (Scratch.extensions) {
        Scratch.extensions.register(new SFFileSystem());
    } else if (window.ScratchExtensions) {
        window.ScratchExtensions.register(EXTENSION_ID, { name: 'SF文件系统' });
    }
})(Scratch || window.Scratch);