// 使用 Chart.js 绘制图表
function updatePieChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        }
    });
}

function updateTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: '支出',
                data: data.map(d => d.expense),
                borderColor: '#FF6384'
            }, {
                label: '收入',
                data: data.map(d => d.income),
                borderColor: '#36A2EB'
            }]
        }
    });
}

function updateBudgetProgress(data) {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['已用', '剩余'],
            datasets: [{
                data: [data.used, data.remaining],
                backgroundColor: ['#FF6384', '#36A2EB']
            }]
        }
    });
} 