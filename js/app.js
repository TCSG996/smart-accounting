// 全局变量
let currentMonth = new Date();
let records = [];

// 数据持久化
const Storage = {
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    load(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
};

// API 接口
const API = {
    async getRecords(month) {
        const response = await fetch(`/api/records/list?month=${month}`);
        return response.json();
    },
    
    async addRecord(record) {
        const response = await fetch('/api/records/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
        return response.json();
    },
    
    async getStatistics(month) {
        const response = await fetch(`/api/records/statistics?month=${month}`);
        return response.json();
    },
    
    async exportRecords(format = 'excel') {
        window.location.href = `/api/records/export?format=${format}`;
    },
    
    async importRecords(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/records/import', {
            method: 'POST',
            body: formData
        });
        return response.json();
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadRecords();
    setupEventListeners();
});

// 初始化应用
function initializeApp() {
    // 设置月份选择器
    updateMonthDisplay();
    
    // 初始化记账分类
    initializeCategories();
}

// 更新月份显示
function updateMonthDisplay() {
    const monthPicker = document.querySelector('.month-picker');
    monthPicker.textContent = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;
}

// 初始化记账分类
function initializeCategories() {
    const categories = [
        { icon: '🍜', name: '餐饮', color: '#ff9500' },
        { icon: '🚌', name: '交通', color: '#007aff' },
        { icon: '🛒', name: '购物', color: '#ff2d55' },
        { icon: '🏠', name: '居住', color: '#5856d6' },
        { icon: '📱', name: '通讯', color: '#5ac8fa' },
        { icon: '➕', name: '更多', color: '#8e8e93' }
    ];
}

// 设置事件监听
function setupEventListeners() {
    // 月份选择
    document.querySelector('.month-picker').addEventListener('click', showMonthPicker);
    
    // 同步按钮
    document.querySelector('.sync-btn').addEventListener('click', syncData);
    
    // 分类按钮点击
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => showAddRecordModal(item.querySelector('span:last-child').textContent));
    });
    
    // 添加记录按钮
    document.querySelector('.add-button').addEventListener('click', () => showAddRecordModal());
    
    // 添加导入导出按钮事件
    document.querySelector('.export-btn').onclick = exportRecords;
    document.querySelector('.import-btn').onclick = importRecords;
}

// 显示月份选择器
function showMonthPicker() {
    const picker = document.createElement('div');
    picker.className = 'month-picker-modal';
    picker.innerHTML = `
        <div class="picker-content">
            <div class="picker-header">
                <button class="prev-year">◀</button>
                <span>${currentMonth.getFullYear()}</span>
                <button class="next-year">▶</button>
            </div>
            <div class="months-grid">
                ${Array.from({length: 12}, (_, i) => 
                    `<button class="month-btn ${currentMonth.getMonth() === i ? 'active' : ''}">${i + 1}月</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(picker);
    
    // 添加事件监听
    picker.addEventListener('click', (e) => {
        if (e.target.classList.contains('month-btn')) {
            currentMonth.setMonth(parseInt(e.target.textContent) - 1);
            updateMonthDisplay();
            loadRecords();
            picker.remove();
        }
    });
}

// 显示记账弹窗
function showAddRecordModal(category = '') {
    const modal = document.querySelector('.add-record-modal');
    modal.style.display = 'flex';
    
    // 构建分类选择的HTML
    const categorySelectHtml = category 
        ? `<div class="selected-category">${category}</div>`
        : `<select>
              <option value="">选择分类</option>
              <option value="餐饮">餐饮</option>
              <option value="交通">交通</option>
              <option value="购物">购物</option>
              <option value="居住">居住</option>
              <option value="通讯">通讯</option>
              <option value="其他">其他</option>
           </select>`;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>记一笔</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="amount-input">
                    <span class="currency">¥</span>
                    <input type="number" placeholder="0.00" step="0.01">
                </div>
                <div class="category-select">
                    ${categorySelectHtml}
                </div>
                <div class="note-input">
                    <input type="text" placeholder="添加备注...">
                </div>
                <div class="date-input">
                    <input type="datetime-local" value="${new Date().toISOString().slice(0, 16)}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="cancel-btn">取消</button>
                <button class="save-btn">保存</button>
            </div>
        </div>
    `;
    
    // 添加事件监听
    modal.querySelector('.close-btn').onclick = () => modal.style.display = 'none';
    modal.querySelector('.save-btn').onclick = () => saveRecord(modal);
    modal.querySelector('.cancel-btn').onclick = () => modal.style.display = 'none';
    
    // 点击模态框外部关闭
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };

    // 如果是预设分类，添加点击切换功能
    if (category) {
        const categoryDiv = modal.querySelector('.selected-category');
        categoryDiv.onclick = () => {
            const select = document.createElement('select');
            select.innerHTML = `
                <option value="">选择分类</option>
                <option value="餐饮">餐饮</option>
                <option value="交通">交通</option>
                <option value="购物">购物</option>
                <option value="居住">居住</option>
                <option value="通讯">通讯</option>
                <option value="其他">其他</option>
            `;
            select.value = category;
            categoryDiv.parentNode.replaceChild(select, categoryDiv);
        };
    }
}

// 保存记录
async function saveRecord(modal) {
    const amount = modal.querySelector('input[type="number"]').value;
    const category = modal.querySelector('.selected-category')?.textContent || 
                    modal.querySelector('select').value;
    const note = modal.querySelector('.note-input input').value;
    const date = modal.querySelector('input[type="datetime-local"]').value;
    
    if (!amount || !category) {
        alert('请填写金额和分类');
        return;
    }
    
    const record = {
        id: Date.now(),
        amount: parseFloat(amount),
        category,
        note,
        date: date || new Date().toISOString(),
        type: amount > 0 ? 'income' : 'expense'
    };
    
    try {
        const response = await API.addRecord(record);
        if (response.success) {
            records.unshift(record);
            Storage.save('records', records);
            updateRecordsList();
            updateStatistics();
            modal.style.display = 'none';
        } else {
            alert(response.message || '保存失败');
        }
    } catch (error) {
        console.error('保存记录失败:', error);
        alert('保存失败，请稍后重试');
    }
}

// 更新记录列表
function updateRecordsList() {
    const recordList = document.querySelector('.record-list');
    recordList.innerHTML = records.map(record => `
        <div class="record-item">
            <div class="record-icon">${getCategoryIcon(record.category)}</div>
            <div class="record-info">
                <div class="record-title">${record.note || record.category}</div>
                <div class="record-time">${formatDate(record.date)}</div>
            </div>
            <div class="record-amount ${record.type}">
                ${record.type === 'income' ? '+' : '-'}${Math.abs(record.amount).toFixed(2)}
            </div>
        </div>
    `).join('');
}

// 更新统计数据
function updateStatistics() {
    const currentMonthRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth.getMonth() &&
               recordDate.getFullYear() === currentMonth.getFullYear();
    });
    
    const income = currentMonthRecords
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);
        
    const expense = currentMonthRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + Math.abs(r.amount), 0);
        
    document.querySelector('.amount').textContent = `¥${expense.toFixed(2)}`;
    document.querySelector('.income').textContent = `¥${income.toFixed(2)}`;
    document.querySelector('.budget').textContent = `¥${(income - expense).toFixed(2)}`;
}

// 同步数据
function syncData() {
    const syncBtn = document.querySelector('.sync-btn');
    syncBtn.style.transform = 'rotate(360deg)';
    
    // 模拟同步过程
    setTimeout(() => {
        syncBtn.style.transform = 'none';
        alert('数据同步成功！');
    }, 1000);
}

// 工具函数
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return `今天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `昨天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
}

function getCategoryIcon(category) {
    const icons = {
        '餐饮': '🍜',
        '交通': '🚌',
        '购物': '🛒',
        '居住': '🏠',
        '通讯': '📱'
    };
    return icons[category] || '💰';
}

// 加载记录数据
async function loadRecords() {
    try {
        // 先尝试从本地加载
        let cachedRecords = Storage.load('records');
        if (cachedRecords) {
            records = cachedRecords;
            updateRecordsList();
            updateStatistics();
        }
        
        // 从服务器获取最新数据
        const month = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`;
        const response = await API.getRecords(month);
        
        if (response.success) {
            records = response.data;
            Storage.save('records', records);
            updateRecordsList();
            updateStatistics();
        }
    } catch (error) {
        console.error('加载记录失败:', error);
    }
}

// 添加导出功能
function exportRecords() {
    const format = prompt('请选择导出格式 (excel/csv):', 'excel');
    if (format) {
        API.exportRecords(format.toLowerCase());
    }
}

// 添加导入功能
function importRecords() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.csv';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const response = await API.importRecords(file);
                if (response.success) {
                    alert('导入成功');
                    loadRecords();
                } else {
                    alert(response.message || '导入失败');
                }
            } catch (error) {
                console.error('导入失败:', error);
                alert('导入失败，请稍后重试');
            }
        }
    };
    
    input.click();
}

// 添加更多统计功能
async function loadStatistics() {
    try {
        const month = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`;
        const response = await API.getStatistics(month);
        
        if (response.success) {
            const stats = response.data;
            updateDetailedStatistics(stats);
        }
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

function updateDetailedStatistics(stats) {
    // 更新饼图
    updatePieChart(stats.categoryDistribution);
    // 更新趋势图
    updateTrendChart(stats.dailyTrend);
    // 更新预算进度
    updateBudgetProgress(stats.budgetUsage);
} 