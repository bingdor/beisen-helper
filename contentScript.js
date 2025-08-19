// 创建统计面板元素
function createPanel() {
  // 检查面板是否已存在
  if (document.getElementById('attendance-panel')) {
    return document.getElementById('attendance-panel');
  }
  
  const panel = document.createElement('div');
  panel.id = 'attendance-panel';
  panel.className = 'attendance-panel';
  panel.innerHTML = `
    <style>
      .attendance-panel {
        position: fixed;
        right: 20px;
        top: 20px;
        width: 380px;
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        border: 1px solid rgba(255,255,255,0.8);
        user-select: none;
        transition: box-shadow 0.2s ease;
      }
      .attendance-panel.dragging {
        box-shadow: 0 12px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15);
        cursor: grabbing !important;
      }
      .attendance-panel.draggable {
        cursor: grab;
      }
      .panel-header {
        padding: 14px 18px;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        cursor: grab;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        user-select: none;
      }
      .panel-header:active {
        cursor: grabbing;
      }
      .panel-title {
        font-weight: 600;
        color: white;
        font-size: 14px;
        flex: 1;
        margin-right: 10px;
      }
      .panel-toggle {
        color: rgba(255,255,255,0.9);
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      .panel-toggle:hover {
        background-color: rgba(255,255,255,0.1);
      }
      .panel-content {
        padding: 18px;
        max-height: 500px;
        overflow-y: auto;
        background: rgba(248, 250, 252, 0.5);
      }
      .summary-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 20px;
      }
      .stat-item {
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .stat-label {
        font-size: 12px;
        color: #64748b;
        margin-bottom: 4px;
        font-weight: 500;
      }
      .stat-value {
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
      }
      .section-title {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e5e7eb;
      }
      .daily-records {
        margin-top: 16px;
      }
      .daily-record {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f5f5f5;
        font-size: 13px;
      }
      .record-date {
        color: #333;
      }
      .record-hours {
        font-weight: 500;
      }
      .short-leave {
        color: #e67e22;
      }
      .normal-day {
        color: #27ae60;
      }
      .panel-footer {
        padding: 14px 18px;
        font-size: 12px;
        color: #64748b;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 0 0 12px 12px;
      }
      .minimized .panel-content {
        display: none;
      }
      .minimized .panel-footer {
        display: none;
      }
      .minimized {
        width: auto !important;
        min-width: 200px;
      }
      .minimized .panel-header {
        border-radius: 12px;
      }
      @media (max-width: 768px) {
        .attendance-panel {
          width: 90%;
          left: 5%;
          right: 5%;
        }
      }
    </style>
          <div class="panel-header" id="panel-header">
        <div class="panel-title">
          <img src="${chrome.runtime.getURL('icons/icon32.png')}" style="width: 24px; height: 24px; margin-right: 5px; vertical-align: middle;" alt="北森魔方">
          北森魔方
        </div>
        <div class="panel-toggle">-</div>
      </div>
    <div class="panel-content" id="panel-content">
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-label">总工作时长</div>
          <div class="stat-value" id="total-hours">0.00 小时</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">出勤天数</div>
          <div class="stat-value" id="work-days">0 天</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">短假天数</div>
          <div class="stat-value" id="short-leave-days">0 天</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">平均每日时长</div>
          <div class="stat-value" id="average-hours">0.00 小时</div>
        </div>
      </div>
      
      <div class="daily-records">
        <div class="section-title collapsible" id="daily-records-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
          <span>工时明细</span>
          <span class="toggle-icon" style="font-size: 12px; color: #666;">▶</span>
        </div>
        <div id="records-container" class="collapsed" style="display: none;"></div>
      </div>
    </div>
    <div class="panel-footer">
      <div id="status-info">正在初始化插件...</div>
      <div style="margin-top: 12px; text-align: center; display: flex; gap: 8px; justify-content: center;">
        <button id="copy-data-btn" style="padding: 8px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s ease;">📋 复制数据</button>
        <button id="refresh-btn" style="padding: 8px 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s ease;">🔄 重新加载</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // 添加拖动功能
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelStartX = 0;
  let panelStartY = 0;
  
  const header = document.getElementById('panel-header');
  const toggle = document.querySelector('.panel-toggle');
  
  // 鼠标按下事件
  header.addEventListener('mousedown', (e) => {
    // 如果点击的是切换按钮，不启动拖动
    if (e.target === toggle || toggle.contains(e.target)) {
      return;
    }
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = panel.getBoundingClientRect();
    panelStartX = rect.left;
    panelStartY = rect.top;
    
    panel.classList.add('dragging');
    e.preventDefault();
  });
  
  // 鼠标移动事件
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    const newX = panelStartX + deltaX;
    const newY = panelStartY + deltaY;
    
    // 确保面板不会完全移出视窗
    const maxX = window.innerWidth - panel.offsetWidth;
    const maxY = window.innerHeight - panel.offsetHeight;
    
    panel.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
    panel.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    panel.style.right = 'auto';
  });
  
  // 鼠标释放事件
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      panel.classList.remove('dragging');
    }
  });
  
  // 添加面板折叠/展开功能
  const content = document.getElementById('panel-content');
  
  toggle.addEventListener('click', (e) => {
    e.stopPropagation(); // 防止触发拖动
    panel.classList.toggle('minimized');
    content.style.display = panel.classList.contains('minimized') ? 'none' : 'block';
    toggle.textContent = panel.classList.contains('minimized') ? '+' : '-';
  });
  
  // 添加每日明细折叠功能
  const dailyRecordsHeader = document.getElementById('daily-records-header');
  const recordsContainer = document.getElementById('records-container');
  const toggleIcon = dailyRecordsHeader.querySelector('.toggle-icon');
  
  if (dailyRecordsHeader && recordsContainer && toggleIcon) {
    dailyRecordsHeader.addEventListener('click', () => {
      const isCollapsed = recordsContainer.classList.contains('collapsed');
      
      if (isCollapsed) {
        // 展开
        recordsContainer.classList.remove('collapsed');
        recordsContainer.style.display = 'block';
        toggleIcon.textContent = '▼';
        console.log('📖 展开每日明细');
      } else {
        // 折叠
        recordsContainer.classList.add('collapsed');
        recordsContainer.style.display = 'none';
        toggleIcon.textContent = '▶';
        console.log('📕 折叠每日明细');
      }
    });
  }

  // 添加复制数据按钮事件
  const copyDataBtn = document.getElementById('copy-data-btn');
  if (copyDataBtn) {
    copyDataBtn.addEventListener('click', async () => {
      console.log('📋 用户点击复制数据按钮');
      
      try {
        // 获取面板数据
        const totalHours = document.getElementById('total-hours')?.textContent || '0.00 小时';
        const workDays = document.getElementById('work-days')?.textContent || '0 天';
        const shortLeaveDays = document.getElementById('short-leave-days')?.textContent || '0 天';
        const averageHours = document.getElementById('average-hours')?.textContent || '0.00 小时';
        
        // 获取每日明细数据
        const recordsContainer = document.getElementById('records-container');
        let dailyDetails = '';
        if (recordsContainer) {
          const records = recordsContainer.querySelectorAll('.daily-record');
          if (records.length > 0) {
            dailyDetails = '\n\n每日明细:\n';
            records.forEach(record => {
              const date = record.querySelector('.record-date')?.textContent || '';
              const hours = record.querySelector('.record-hours')?.textContent || '';
              dailyDetails += `${date}: ${hours}\n`;
            });
          }
        }
        
        // 构建复制文本
        const copyText = `📊 考勤统计数据

总工作时长: ${totalHours}
出勤天数: ${workDays}
短假天数: ${shortLeaveDays}
平均每日时长: ${averageHours}${dailyDetails}

📅 统计时间: ${new Date().toLocaleString()}
🔗 数据来源: 北森魔方`;
        
        // 复制到剪切板
        await navigator.clipboard.writeText(copyText);
        
        // 更新按钮状态
        const originalText = copyDataBtn.textContent;
        copyDataBtn.textContent = '✅ 已复制';
        copyDataBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        // 2秒后恢复按钮状态
        setTimeout(() => {
          copyDataBtn.textContent = originalText;
          copyDataBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 2000);
        
        console.log('✅ 数据已复制到剪切板');
        
      } catch (error) {
        console.error('❌ 复制数据失败:', error);
        
        // 显示错误状态
        const originalText = copyDataBtn.textContent;
        copyDataBtn.textContent = '❌ 复制失败';
        copyDataBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        
        setTimeout(() => {
          copyDataBtn.textContent = originalText;
          copyDataBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 2000);
      }
    });
  }

  // 添加重新加载按钮事件
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      console.log('🔄 用户点击重新加载按钮');
      
      // 更新按钮状态
      const originalText = refreshBtn.textContent;
      refreshBtn.textContent = '⏳ 重新加载中...';
      refreshBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      refreshBtn.disabled = true;
      
      // 更新状态信息
      const statusInfo = document.getElementById('status-info');
      if (statusInfo) {
        statusInfo.textContent = '正在重新初始化拦截器...';
      }
      
      // 清理现有标记
      delete window.__attendanceInterceptorActive__;
      delete window.__attendanceFallbackActive__;
      
      // 重新初始化
      setTimeout(() => {
        try {
          initializeWithRetry();
          
          // 恢复按钮状态
          setTimeout(() => {
            refreshBtn.textContent = originalText;
            refreshBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            refreshBtn.disabled = false;
            
            if (statusInfo) {
              statusInfo.textContent = '重新加载完成，等待考勤数据...';
            }
          }, 2000);
          
        } catch (error) {
          console.error('❌ 重新加载失败:', error);
          
          refreshBtn.textContent = '❌ 加载失败';
          refreshBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
          
          setTimeout(() => {
            refreshBtn.textContent = originalText;
            refreshBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            refreshBtn.disabled = false;
            
            if (statusInfo) {
              statusInfo.textContent = '重新加载失败，请刷新页面重试';
            }
          }, 3000);
        }
      }, 500);
    });
  }
  

  
  return panel;
}

// 更新统计面板数据
function updatePanel(data) {
  const panel = createPanel();
  
  // 更新汇总统计
  document.getElementById('total-hours').textContent = data.totalWorkHours;
  document.getElementById('work-days').textContent = `${data.workDaysCount} 天`;
  document.getElementById('short-leave-days').textContent = `${data.shortLeaveDaysCount} 天`;
  document.getElementById('average-hours').textContent = data.averageWorkHours;
  
  // 更新每日明细
  const recordsContainer = document.getElementById('records-container');
  recordsContainer.innerHTML = '';
  
  data.dailyRecords.forEach(record => {
    const recordEl = document.createElement('div');
    recordEl.className = 'daily-record';
    
    const dateEl = document.createElement('div');
    dateEl.className = 'record-date';
    dateEl.textContent = record.date;
    
    const hoursEl = document.createElement('div');
    hoursEl.className = `record-hours ${record.isShortLeave ? 'short-leave' : 'normal-day'}`;
    hoursEl.textContent = `${record.workHours} 小时${record.isShortLeave ? ' (短假)' : ''}`;
    
    recordEl.appendChild(dateEl);
    recordEl.appendChild(hoursEl);
    recordsContainer.appendChild(recordEl);
  });
}

/**
 * 工具函数：将小时字符串转换为放大100倍的整数（解决浮点精度问题）
 */
function convertHoursToInt(hoursStr) {
  if (!hoursStr || typeof hoursStr !== 'string') {
    return 0;
  }
  
  const hasDecimal = hoursStr.includes('.');
  const normalizedStr = hasDecimal ? hoursStr : `${hoursStr}.00`;
  const [integerPart, decimalPart] = normalizedStr.split('.');
  const fixedDecimal = (decimalPart || '00').padEnd(2, '0').slice(0, 2);
  
  return parseInt(integerPart, 10) * 100 + parseInt(fixedDecimal, 10);
}

/**
 * 工具函数：将放大的整数转换为小时字符串
 */
function convertIntToHours(intValue) {
  return (intValue / 100).toFixed(2);
}

/**
 * 处理考勤数据并更新面板
 */
function processAttendanceData(attendanceData) {
  console.log('🔍 开始处理考勤数据:', JSON.stringify(attendanceData));
  
  // 直接查找biz_data数组
  let dataArray = null;
  
  if (attendanceData.biz_data && Array.isArray(attendanceData.biz_data)) {
    dataArray = attendanceData.biz_data;
    console.log('✅ 直接找到biz_data数组，包含', dataArray.length, '条记录');
  } else {
    // 备用：递归查找数据数组
    function findAttendanceArray(obj, path = '') {
      if (Array.isArray(obj)) {
        console.log(`📋 找到数组 ${path}:`, obj.length, '条记录');
        return obj;
      }
      
      if (obj && typeof obj === 'object') {
        // 优先查找biz_data字段
        if (obj.biz_data && Array.isArray(obj.biz_data)) {
          console.log(`📋 找到biz_data数组 ${path}.biz_data:`, obj.biz_data.length, '条记录');
          return obj.biz_data;
        }
        
        // 其他常见字段
        const commonFields = ['cmp_data', 'data', 'list', 'items', 'records', 'result'];
        
        for (const field of commonFields) {
          if (obj[field]) {
            console.log(`🔍 检查字段 ${path}.${field}:`, typeof obj[field]);
            const result = findAttendanceArray(obj[field], `${path}.${field}`);
            if (result) return result;
          }
        }
      }
      
      return null;
    }
    
    dataArray = findAttendanceArray(attendanceData);
  }
  
  if (!dataArray || dataArray.length === 0) {
    console.log('❌ 未找到有效的考勤数据数组');
    
    // 更新状态信息
    const statusInfo = document.getElementById('status-info');
    if (statusInfo) {
      statusInfo.textContent = '未找到有效的考勤数据';
    }
    return;
  }
  
  console.log('✅ 找到考勤数据数组，包含', dataArray.length, '条记录');
  
  let totalWorkInt = 0;
  let workDaysCount = 0;
  let shortLeaveDaysCount = 0;
  const dailyRecords = [];
  
  dataArray.forEach((dayData, index) => {
    console.log(`📝 处理第${index + 1}条记录:`, JSON.stringify(dayData));
    
    // 解析日期信息
    const dateInfo = dayData.SwipingCardDate || {};
    const date = dateInfo.value || dateInfo.text || `未知日期（第${index + 1}条）`;
    console.log(`📅 日期: ${date}`);
    
    // 解析工作时长信息
    const workTimeInfo = dayData.WorkPeriodExcludeRestTime || {};
    const workHoursStr = workTimeInfo.value || workTimeInfo.text || '0';
    console.log(`⏰ 工作时长字符串: ${workHoursStr}`);
    
    // 转换工作时长
    const workInt = convertHoursToInt(workHoursStr);
    const workHours = convertIntToHours(workInt);
    console.log(`⏰ 工作时长: ${workHours} 小时 (内部值: ${workInt})`);
    
    // 判断是否为短假（工作时长小于8小时但大于0）
    const isShortLeave = workInt > 0 && workInt < 800;
    if (isShortLeave) {
      console.log(`🟡 检测到短假: ${workHours} 小时`);
    } else if (workInt > 0) {
      console.log(`🟢 正常工作日: ${workHours} 小时`);
    } else {
      console.log(`⚪ 休息日或无数据`);
    }
    
    dailyRecords.push({ 
      date: date, 
      workHours: workHours, 
      isShortLeave: isShortLeave 
    });
    
    totalWorkInt += workInt;
    if (workInt > 0) {
      workDaysCount++;
      if (isShortLeave) {
        shortLeaveDaysCount++;
      }
    }
  });
  
  const averageWorkInt = workDaysCount > 0 ? Math.round(totalWorkInt / workDaysCount) : 0;
  const totalWorkHours = `${convertIntToHours(totalWorkInt)} 小时`;
  const averageWorkHours = `${convertIntToHours(averageWorkInt)} 小时`;
  
  updatePanel({
    totalWorkHours,
    workDaysCount,
    shortLeaveDaysCount,
    averageWorkHours,
    dailyRecords
  });
  
  console.log('✅ 考勤数据处理完成');
  console.log(`📊 统计结果: 总时长${totalWorkHours}, 出勤${workDaysCount}天, 短假${shortLeaveDaysCount}天, 平均${averageWorkHours}`);
  
  // 更新状态信息
  const statusInfo = document.getElementById('status-info');
  if (statusInfo) {
    statusInfo.textContent = `数据更新完成 - 共处理${dataArray.length}条记录`;
  }
}

// 检查请求URL是否是目标考勤API
function isTargetAttendanceAPI(url) {
  if (!url) return false;
  
  const attendanceKeywords = [
    'Attendance.SingleObjectListView.EmpAttendanceDataList',
    'Attendance.SingleObjectListView.EmpAttendanceDataLis',
    'Attendance.AttendanceStatistics'
  ];
  
  return url.includes('api/v2/UI/TableList') && 
         attendanceKeywords.some(keyword => url.includes(keyword));
}

// 处理响应数据
async function handleResponse(response, requestUrl) {
  console.log('🎯 拦截到目标请求:', requestUrl);
  
  try {
      const clonedResponse = response.clone();
      const responseData = await clonedResponse.json();
      
    console.log('📋 响应数据结构:', Object.keys(responseData));
    
      if (responseData?.biz_data && Array.isArray(responseData.biz_data)) {
      console.log('🎉 检测到考勤数据，开始处理...', responseData.biz_data.length + ' 条记录');
        processAttendanceData(responseData.biz_data);
      
      // 更新状态信息
      const statusInfo = document.getElementById('status-info');
      if (statusInfo) {
        statusInfo.textContent = `已加载 ${responseData.biz_data.length} 条考勤记录`;
      }
    } else {
      console.log('⚠️ 响应数据格式不符合预期:', responseData);
      
      // 更新状态信息
      const statusInfo = document.getElementById('status-info');
      if (statusInfo) {
        statusInfo.textContent = '数据格式不正确';
      }
    }
  } catch (error) {
    console.error('❌ 考勤数据解析失败:', error);
  }
}

// 设置fetch拦截器，适配所有fetch修改
function setupFetchInterceptor() {
  console.log('🔧 设置最终fetch拦截器...');
  
  // 获取当前的fetch（已被多次修改）
  const currentFetch = window.fetch;
  
  // 显示当前fetch的状态
  const fetchStr = currentFetch.toString();
  console.log('📊 当前fetch函数信息:');
  console.log('  - 长度:', fetchStr.length);
  console.log('  - 包含credentials:', fetchStr.includes('credentials'));
  console.log('  - 包含云端处理:', fetchStr.includes('cloud.italent') || fetchStr.includes('getHostByType'));
  console.log('  - 包含Mo特征:', fetchStr.includes('jo('));
  console.log('  - 函数预览:', fetchStr.substring(0, 300) + '...');
  
  // 重写fetch - 这会影响主页面和所有iframe
  window.fetch = async function(resource, options) {
    const requestUrl = typeof resource === 'string' ? resource : (resource.url || '');
    
    // 记录所有网络请求（包括iframe中的）
    if (requestUrl.includes('api/')) {
      console.log('📡 全局检测到API请求:', requestUrl);
    }
    
    // 特别标记考勤相关请求
    if (requestUrl.includes('cloud.italent.cn') && requestUrl.includes('api/')) {
      console.log('🎯 检测到云端API请求:', requestUrl);
    }
    
    // 检查是否是目标请求
    if (isTargetAttendanceAPI(requestUrl)) {
      console.log('🎯 检测到目标考勤请求:', requestUrl);
      
      // 更新状态信息
      const statusInfo = document.getElementById('status-info');
      if (statusInfo) {
        statusInfo.textContent = '正在加载考勤数据...';
      }
    }
    
    try {
      // 调用被Mo函数修改过的fetch
      const response = await currentFetch(resource, options);
      
      // 处理目标请求的响应
      if (isTargetAttendanceAPI(requestUrl)) {
        await handleResponse(response, requestUrl);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Fetch请求失败:', error);
      
      // 更新状态信息
      if (isTargetAttendanceAPI(requestUrl)) {
        const statusInfo = document.getElementById('status-info');
        if (statusInfo) {
          statusInfo.textContent = '数据加载失败';
        }
      }
      
      throw error;
    }
  };
  
  console.log('✅ fetch拦截器设置完成');
}

// 设置iframe拦截器
function setupIframeInterceptor(iframe) {
  try {
    const iframeWindow = iframe.contentWindow;
    console.log('🖼️ 尝试设置iframe拦截器...', iframe.src || '无src');
    
    if (!iframeWindow) {
      console.log('⚠️ 无法访问iframe.contentWindow');
      return;
    }
    
    // 检查是否存在跨域限制
    try {
      // 尝试访问iframe的fetch属性来检测跨域限制
      const fetchExists = !!iframeWindow.fetch;
      console.log('🖼️ iframe.fetch存在:', fetchExists);
      
      if (!fetchExists) {
        console.log('⚠️ iframe中没有fetch函数');
        return;
      }
      
      console.log('🖼️ 设置iframe拦截器...', iframe.src || '无src');
      
      // 保存原始fetch
      const originalIframeFetch = iframeWindow.fetch;
      
      // 重写iframe的fetch
      iframeWindow.fetch = async function(resource, options) {
        const requestUrl = typeof resource === 'string' ? resource : (resource.url || '');
        
        // 记录iframe中的所有请求（调试用）
        console.log('🖼️🌐 iframe中的fetch请求:', requestUrl);
        
        // 记录iframe中的API请求
        if (requestUrl.includes('api/')) {
          console.log('🖼️📡 iframe中检测到API请求:', requestUrl);
        }
        
        // 检查是否是目标请求
        if (isTargetAttendanceAPI(requestUrl)) {
          console.log('🖼️🎯 iframe中检测到目标请求:', requestUrl);
          
          // 更新状态信息
          const statusInfo = parent.document.getElementById('status-info');
          if (statusInfo) {
            statusInfo.textContent = '正在加载考勤数据...';
          }
        }
        
        try {
          // 调用原始fetch
          const response = await originalIframeFetch.call(this, resource, options);
          
          // 处理目标请求的响应
          if (isTargetAttendanceAPI(requestUrl)) {
            await handleResponse(response, requestUrl);
          }
          
          return response;
        } catch (error) {
          console.error('❌ iframe Fetch请求失败:', error);
          
          // 更新状态信息
          if (isTargetAttendanceAPI(requestUrl)) {
            const statusInfo = parent.document.getElementById('status-info');
            if (statusInfo) {
              statusInfo.textContent = '数据加载失败';
            }
          }
          
          throw error;
        }
      };
      
      console.log('✅ iframe拦截器设置完成');
      
    } catch (crossOriginError) {
      console.log('🚫 跨域限制，无法直接访问iframe:', crossOriginError.message);
      console.log('🔄 将使用替代方案监听网络请求...');
      // 跨域情况下，我们依赖Performance API来监听请求
      return;
    }
    
  } catch (error) {
    console.log('⚠️ 设置iframe拦截器时发生错误:', error.message);
  }
}

// 监听iframe加载
function watchForIframes() {
  console.log('👁️ 开始监听iframe...');
  
  // 检查现有的iframe
  function checkExistingIframes() {
    const iframes = document.querySelectorAll('iframe');
    console.log(`🔍 发现 ${iframes.length} 个iframe`);
    
    iframes.forEach((iframe, index) => {
      console.log(`🖼️ 处理iframe ${index + 1}: ${iframe.src || '无src'}`);
      console.log(`🖼️ iframe ${index + 1} readyState:`, iframe.contentDocument?.readyState);
      
      // 检查是否是考勤相关的iframe
      const isAttendanceIframe = iframe.src && (
        iframe.src.includes('Attendance') || 
        iframe.src.includes('attendance') ||
        (iframe.src.includes('cloud.italent.cn') && iframe.src.includes('Attendance'))
      ) || (iframe.id && iframe.id.includes('popup_'));
      
      if (isAttendanceIframe) {
        console.log(`🎯 发现考勤相关iframe: ${iframe.src}`);
      }
      
      if (iframe.contentWindow) {
        // 如果iframe已经加载完成
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          setupIframeInterceptor(iframe);
        } else {
          // 等待iframe加载完成
          iframe.addEventListener('load', () => {
            console.log(`🖼️ iframe ${index + 1} 加载完成`);
            setTimeout(() => setupIframeInterceptor(iframe), 500);
          });
          
          // 对考勤iframe进行额外的监听
          if (isAttendanceIframe) {
            console.log(`🎯 检测到考勤iframe，使用Performance API监听`);
            // 由于跨域限制，主要依赖Performance API监听网络请求
          }
        }
      }
    });
  }
  
  // 立即检查
  checkExistingIframes();
  
  // 定期检查新的iframe
  setInterval(checkExistingIframes, 2000);
  
  // 特别监听考勤popup iframe的出现
  function waitForAttendancePopup() {
    // 搜索所有可能的考勤iframe
    const allIframes = document.querySelectorAll('iframe');
    const popupIframes = Array.from(allIframes).filter(iframe => 
      iframe.id && iframe.id.includes('popup_')
    );
    const attendanceIframes = Array.from(allIframes).filter(iframe => 
      iframe.src && iframe.src.includes('Attendance')
    );
    
    console.log(`🔍 搜索考勤iframe - popup类型: ${popupIframes.length}, 包含Attendance: ${attendanceIframes.length}`);
    
    // 显示所有iframe的信息
    allIframes.forEach((iframe, index) => {
      console.log(`📋 iframe ${index + 1}: id="${iframe.id}", src="${iframe.src || '无src'}"`);
    });
    
    // 查找考勤iframe
    const attendancePopup = Array.from(allIframes).find(iframe => 
      (iframe.id && iframe.id.includes('popup_') && iframe.src && iframe.src.includes('Attendance')) ||
      (iframe.src && iframe.src.includes('cloud.italent.cn/Attendance'))
    );
    
    if (attendancePopup) {
      console.log('🎯 发现考勤popup iframe:', attendancePopup.id, attendancePopup.src);
      
      // 等待iframe加载完成
      attendancePopup.addEventListener('load', () => {
        console.log('🎯 考勤popup iframe加载完成');
        setTimeout(() => {
          setupIframeInterceptor(attendancePopup);
        }, 1000);
      });
      
      // 如果已经加载完成
      if (attendancePopup.contentDocument && attendancePopup.contentDocument.readyState === 'complete') {
        console.log('🎯 考勤popup iframe已经加载完成');
        setTimeout(() => {
          setupIframeInterceptor(attendancePopup);
        }, 1000);
      }
      
      return true; // 找到了，停止搜索
    } else {
      console.log('⏳ 未找到考勤popup iframe，继续等待...');
      return false; // 继续搜索
    }
  }
  
  // 持续等待考勤popup
  let popupCheckCount = 0;
  const maxPopupChecks = 60; // 等待1分钟
  
  function checkForPopup() {
    popupCheckCount++;
    const found = waitForAttendancePopup();
    
    if (!found && popupCheckCount < maxPopupChecks) {
      setTimeout(checkForPopup, 1000);
    } else if (!found) {
      console.log('⏰ 考勤popup iframe等待超时');
    }
  }
  
  // 开始检查
  checkForPopup();
  
  // 使用MutationObserver监听DOM变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 检查新添加的iframe
          if (node.tagName === 'IFRAME') {
            console.log('🆕 检测到新的iframe');
            node.addEventListener('load', () => {
              setTimeout(() => setupIframeInterceptor(node), 500);
            });
          }
          
          // 检查新添加元素的子iframe
          const iframes = node.querySelectorAll ? node.querySelectorAll('iframe') : [];
          iframes.forEach((iframe) => {
            console.log('🆕 检测到子级iframe');
            iframe.addEventListener('load', () => {
              setTimeout(() => setupIframeInterceptor(iframe), 500);
            });
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 增强Performance API监听
function setupEnhancedPerformanceMonitor() {
  console.log('📊 设置增强的Performance API监听...');
  
  // 定期检查Performance API中的新请求
  let lastCheckedTime = Date.now();
  
  const checkPerformanceEntries = () => {
    if (!window.performance || !window.performance.getEntriesByType) {
      return;
    }
    
    const resources = window.performance.getEntriesByType('resource');
    const newRequests = resources.filter(entry => 
      entry.startTime > lastCheckedTime - 60000 && // 检查最近1分钟的请求
      entry.name.includes('api/v2/UI/TableList')
    );
    
    newRequests.forEach(entry => {
      const requestUrl = entry.name;
      console.log('📊 Performance API检测到API请求:', requestUrl);
      
      if (isTargetAttendanceAPI(requestUrl)) {
        console.log('📊🎯 Performance API检测到目标考勤请求:', requestUrl);
        
        // 更新状态信息
        const statusInfo = document.getElementById('status-info');
        if (statusInfo) {
          statusInfo.textContent = '检测到考勤数据请求...';
        }
        
        // 尝试通过其他方式获取响应数据
        // 注意：Performance API只能获取请求信息，无法直接获取响应数据
        console.log('📊 请求详情:', {
          url: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
          startTime: entry.startTime
        });
        
        // 显示检测到的请求信息
        setTimeout(() => {
          const statusInfo = document.getElementById('status-info');
          if (statusInfo) {
            statusInfo.textContent = '已检测到考勤API请求，但因跨域限制无法获取数据';
          }
        }, 1000);
      }
    });
    
    lastCheckedTime = Date.now();
  };
  
  // 每2秒检查一次新的请求
  setInterval(checkPerformanceEntries, 2000);
  
  // 使用PerformanceObserver监听实时请求
  if (window.PerformanceObserver) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'resource' && entry.name.includes('api/v2/UI/TableList')) {
          console.log('📊 PerformanceObserver检测到API请求:', entry.name);
          
          if (isTargetAttendanceAPI(entry.name)) {
            console.log('📊🎯 PerformanceObserver检测到目标考勤请求:', entry.name);
            
            const statusInfo = document.getElementById('status-info');
            if (statusInfo) {
              statusInfo.textContent = '检测到考勤数据请求...';
            }
          }
        }
      });
    });
    
    try {
      observer.observe({entryTypes: ['resource']});
      console.log('✅ PerformanceObserver设置完成');
    } catch (error) {
      console.log('⚠️ PerformanceObserver设置失败:', error.message);
    }
  }
}

// 等待所有fetch修改完成后再设置拦截器
function waitForFetchModifications() {
  console.log('⏳ 等待所有fetch修改完成...');
  
  let checkCount = 0;
  const maxChecks = 40; // 增加到20秒等待时间
  
  const checkInterval = setInterval(() => {
    checkCount++;
    
    const fetchStr = window.fetch.toString();
    console.log(`🔍 检查 ${checkCount}/${maxChecks}: fetch函数长度=${fetchStr.length}`);
    
    // 检查fetch是否已被多次修改
    const hasCredentialsModification = fetchStr.includes('credentials') || fetchStr.includes('include');
    const hasUrlModification = fetchStr.includes('getHostByType') || fetchStr.includes('cloud.italent');
    const hasMoModification = fetchStr.includes('jo(') || fetchStr.length < 200;
    const hasConvoyHelper = window.__convoy__helper__;
    
    console.log('🔍 fetch修改状态:');
    console.log('  - credentials修改:', hasCredentialsModification);
    console.log('  - URL修改:', hasUrlModification);
    console.log('  - Mo修改:', hasMoModification);
    console.log('  - convoy helper存在:', hasConvoyHelper);
    
    // 如果检测到主要的修改特征，等待一段时间确保所有修改完成
    if (hasCredentialsModification || hasMoModification) {
      console.log('✅ 检测到fetch已被修改，等待所有修改完成...');
      clearInterval(checkInterval);
      
      // 等待更长时间确保所有fetch修改都完成
      setTimeout(() => {
        console.log('🔧 开始设置最终的fetch拦截器...');
        setupFetchInterceptor();
        createPanel();
        console.log('🎉 考勤统计插件已启动');
      }, 2000); // 增加等待时间到2秒
      
    } else if (checkCount >= maxChecks) {
      console.log('⏰ 超时，直接设置拦截器');
      clearInterval(checkInterval);
      setupFetchInterceptor();
      createPanel();
      console.log('🎉 考勤统计插件已启动（超时保护）');
    }
  }, 500);
}

// 检测当前运行环境
function detectEnvironment() {
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  console.log('🔍 检测当前环境:', currentUrl);
  console.log('🔍 当前域名:', hostname);
  
  if (hostname === 'cloud.italent.cn') {
    console.log('📍 当前在iframe环境 (cloud.italent.cn)');
    return 'iframe';
  } else if (hostname === 'www.italent.cn') {
    console.log('📍 当前在主页面环境 (www.italent.cn)');
    return 'main';
  } else {
    console.log('📍 未知环境:', hostname);
    return 'unknown';
  }
}

// 在iframe环境中的初始化
function initializeInIframe() {
  console.log('🖼️ 在iframe中初始化插件...');
  console.log('🖼️ 由于Mo函数在主页面执行，iframe应该继承主页面的fetch拦截');
  console.log('🖼️ iframe环境无需额外设置，主页面拦截器已覆盖');
  
  // 只需要验证fetch是否已被修改
  setTimeout(() => {
    const fetchStr = window.fetch.toString();
    const isModified = fetchStr.includes('jo(') || 
                      fetchStr.includes('credentials') || 
                      fetchStr.length < 100;
    
    if (isModified) {
      console.log('🖼️✅ iframe继承了主页面修改后的fetch');
    } else {
      console.log('🖼️⚠️ iframe的fetch似乎没有被修改');
    }
  }, 1000);
}

// 在主页面环境中的初始化
function initializeInMain() {
  console.log('🏠 在主页面中初始化插件...');
  
  // 发现有多个地方修改fetch函数：
  // 1. Mo函数 - 在convoy bundle中
  // 2. convoy helper - URL补全和credentials设置
  // 我们需要等待所有修改完成后再设置拦截器
  
  waitForFetchModifications();
}

// 🎯 页面加载完成后拦截策略
console.log('🚀 考勤统计插件开始初始化（页面加载完成后拦截模式）...');

// 设置最终的fetch拦截器 - 多种方案尝试
function setupFinalInterceptor() {
  console.log('⚡ 开始设置页面环境拦截器...');
  
  // 监听来自页面环境的事件
  window.addEventListener('attendanceApiDetected', (event) => {
    console.log('🎯 [Content Script] 收到API检测事件:', event.detail);
    
    // 更新状态信息
    const statusInfo = document.getElementById('status-info');
    if (statusInfo) {
      statusInfo.textContent = '正在加载考勤数据...';
    }
  });
  
  window.addEventListener('attendanceDataReceived', (event) => {
    console.log('📥 [Content Script] 收到考勤数据:', event.detail);
    
    // 处理接收到的数据
    if (event.detail && event.detail.data) {
      let dataToProcess = event.detail.data;
      
      // 如果收到的是原始文本数据，尝试解析
      if (dataToProcess.raw_text) {
        console.log('📝 [Content Script] 收到原始文本数据，尝试解析...');
        try {
          dataToProcess = JSON.parse(dataToProcess.raw_text);
          console.log('✅ [Content Script] 原始文本解析成功');
        } catch (error) {
          console.log('❌ [Content Script] 原始文本解析失败:', error);
          return;
        }
      }
      
      processAttendanceData(dataToProcess);
    }
  });
  
  // 方案1：尝试注入外部脚本文件
  try {
    console.log('📄 方案1：尝试注入外部脚本文件...');
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.onload = function() {
      console.log('✅ 外部脚本注入成功');
      this.remove();
      
      // 更新状态信息
      const statusInfo = document.getElementById('status-info');
      if (statusInfo) {
        statusInfo.textContent = '✅ 拦截器已启动，等待考勤数据...';
      }
    };
    script.onerror = function() {
      console.log('❌ 外部脚本注入失败，尝试方案2');
      setupDirectInterception();
    };
    (document.head || document.documentElement).appendChild(script);
  } catch (error) {
    console.log('❌ 方案1失败:', error);
    setupDirectInterception();
  }
}

// 方案2：直接在Content Script中设置拦截器
function setupDirectInterception() {
  console.log('📄 方案2：直接在Content Script中设置拦截器...');
  
  try {
    // 保存当前的fetch函数
    const originalFetch = window.fetch;
    console.log('📊 当前fetch函数信息:');
    console.log('  - 长度:', originalFetch.toString().length);
    console.log('  - 预览:', originalFetch.toString().substring(0, 200) + '...');
    
    // 设置新的fetch拦截器
    window.fetch = async function(resource, options) {
      console.log('🌐 [Content Script拦截器] fetch被调用:', resource);
      
      const requestUrl = typeof resource === 'string' ? resource : (resource.url || '');
      
      // 记录所有API请求
      if (requestUrl.includes('/api/')) {
        console.log('📡 [Content Script拦截器] 拦截到API请求:', requestUrl);
      }
      
      // 检查是否是目标考勤请求
      if (isTargetAttendanceAPI(requestUrl)) {
        console.log('🎯 [Content Script拦截器] 拦截到目标考勤请求:', requestUrl);
        
        // 更新状态信息
        const statusInfo = document.getElementById('status-info');
        if (statusInfo) {
          statusInfo.textContent = '正在加载考勤数据...';
        }
      }
      
      try {
        // 调用原始fetch函数
        const response = await originalFetch.call(this, resource, options);
        
        // 处理目标请求的响应
        if (isTargetAttendanceAPI(requestUrl)) {
          // 克隆响应用于处理
          handleResponse(response.clone(), requestUrl);
        }
        
        return response;
      } catch (error) {
        console.error('❌ [Content Script拦截器] fetch请求失败:', error);
        throw error;
      }
    };
    
    console.log('✅ Content Script fetch拦截器设置完成');
    
    // 标记拦截器已设置
    window.__attendanceInterceptorActive__ = true;
    
    // 更新状态信息
    const statusInfo = document.getElementById('status-info');
    if (statusInfo) {
      statusInfo.textContent = '✅ 拦截器已启动，等待考勤数据...';
    }
    
  } catch (error) {
    console.error('❌ 方案2失败:', error);
    
    // 备用方案：使用Performance Observer
    console.log('🔄 启用备用方案：Performance Observer监控');
    setupPerformanceMonitor();
  }
}

// 备用方案：Performance Observer监控
function setupPerformanceMonitor() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('/api/')) {
          console.log('📊 [Performance] 检测到API请求:', entry.name);
          
          if (isTargetAttendanceAPI(entry.name)) {
            console.log('🎯 [Performance] 检测到目标考勤请求:', entry.name);
            
            // 更新状态信息
            const statusInfo = document.getElementById('status-info');
            if (statusInfo) {
              statusInfo.textContent = '检测到考勤API请求...';
            }
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    console.log('✅ Performance Observer已启动');
    
    // 更新状态信息
    const statusInfo = document.getElementById('status-info');
    if (statusInfo) {
      statusInfo.textContent = '✅ 性能监控已启动，等待考勤数据...';
    }
  } else {
    console.log('❌ 浏览器不支持Performance Observer');
  }
}

// 移除自动初始化，改为手动触发
// function initializeAfterPageLoad() {
//   console.log('📄 document_idle模式，页面基本加载完成');
//   console.log('🔍 当前页面状态:', document.readyState);
//   
//   // 短暂等待确保所有脚本执行完毕
//   setTimeout(() => {
//     console.log('⏰ 等待完成，现在设置拦截器');
//     setupFinalInterceptor();
//   }, 1000); // 减少等待时间到1秒
// }

// 改为自动模式 - 页面加载完成后自动开始拦截
console.log('🚀 考勤统计插件已加载（自动模式）- 即将自动启动拦截器');

// 改进的自动启动拦截器函数
function autoStartInterceptor() {
  console.log('🔄 自动启动拦截器...');
  
  // 更新状态信息
  const statusInfo = document.getElementById('status-info');
  if (statusInfo) {
    statusInfo.textContent = '正在启动拦截器...';
  }
  
  // 使用改进的初始化策略
  initializeWithRetry();
}

// 改进的初始化函数，包含重试机制
function initializeWithRetry() {
  console.log('🔄 使用改进的初始化策略...');
  
  let retryCount = 0;
  const maxRetries = 5;
  const retryInterval = 2000; // 2秒
  
  function attemptInitialization() {
    retryCount++;
    console.log(`🔄 初始化尝试 ${retryCount}/${maxRetries}`);
    
    try {
      // 检查是否已经成功初始化
      if (window.__attendanceInterceptorActive__) {
        console.log('✅ 拦截器已激活，跳过重复初始化');
        return;
      }
      
      // 检查页面环境
      const environment = detectEnvironment();
      console.log(`🔍 当前环境: ${environment}`);
      
      // 尝试设置拦截器
      setupFinalInterceptor();
      
      // 验证初始化是否成功
      setTimeout(() => {
        if (window.__attendanceInterceptorActive__) {
          console.log('✅ 拦截器初始化成功');
          const statusInfo = document.getElementById('status-info');
          if (statusInfo) {
            statusInfo.textContent = '✅ 拦截器已启动，等待考勤数据...';
          }
        } else {
          console.log('⚠️ 拦截器初始化可能失败，将重试');
          if (retryCount < maxRetries) {
            setTimeout(attemptInitialization, retryInterval);
          } else {
            console.log('❌ 达到最大重试次数，使用备用方案');
            setupFallbackStrategy();
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ 初始化过程中发生错误:', error);
      if (retryCount < maxRetries) {
        setTimeout(attemptInitialization, retryInterval);
      } else {
        console.log('❌ 达到最大重试次数，使用备用方案');
        setupFallbackStrategy();
      }
    }
  }
  
  // 开始初始化
  attemptInitialization();
}

// 备用策略
function setupFallbackStrategy() {
  console.log('🔄 启用备用策略...');
  
  const statusInfo = document.getElementById('status-info');
  if (statusInfo) {
    statusInfo.textContent = '正在使用备用方案...';
  }
  
  // 方案1：直接注入脚本到页面
  try {
    const script = document.createElement('script');
    script.textContent = `
      // 备用注入脚本
      (function() {
        console.log('📄 [备用脚本] 开始注入...');
        
        // 检查是否已经注入
        if (window.__attendanceFallbackActive__) {
          console.log('📄 [备用脚本] 已存在，跳过');
          return;
        }
        
        // 标记已注入
        window.__attendanceFallbackActive__ = true;
        
        // 保存原始fetch
        const originalFetch = window.fetch;
        
        // 重写fetch
        window.fetch = async function(resource, options) {
          const requestUrl = typeof resource === 'string' ? resource : (resource.url || '');
          
          // 检查考勤API
          if (requestUrl.includes('api/v2/UI/TableList') && 
              (requestUrl.includes('Attendance') || requestUrl.includes('attendance'))) {
            console.log('🎯 [备用脚本] 检测到考勤请求:', requestUrl);
            
            // 通知content script
            window.dispatchEvent(new CustomEvent('attendanceApiDetected', {
              detail: { url: requestUrl, options: options }
            }));
          }
          
          try {
            const response = await originalFetch.call(this, resource, options);
            
            // 处理响应
            if (requestUrl.includes('api/v2/UI/TableList') && 
                (requestUrl.includes('Attendance') || requestUrl.includes('attendance'))) {
              const clonedResponse = response.clone();
              clonedResponse.text().then(text => {
                try {
                  const data = JSON.parse(text);
                  window.dispatchEvent(new CustomEvent('attendanceDataReceived', {
                    detail: { url: requestUrl, data: data }
                  }));
                } catch (error) {
                  console.log('📄 [备用脚本] JSON解析失败:', error);
                }
              });
            }
            
            return response;
          } catch (error) {
            console.error('❌ [备用脚本] fetch失败:', error);
            throw error;
          }
        };
        
        console.log('✅ [备用脚本] 注入完成');
      })();
    `;
    
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    
    console.log('✅ 备用脚本注入成功');
    
    if (statusInfo) {
      statusInfo.textContent = '✅ 备用方案已启动，等待考勤数据...';
    }
    
  } catch (error) {
    console.error('❌ 备用脚本注入失败:', error);
    
    // 最后的备用方案：使用MutationObserver监听DOM变化
    setupDOMObserver();
  }
}

// DOM变化监听备用方案
function setupDOMObserver() {
  console.log('🔄 启用DOM监听备用方案...');
  
  const statusInfo = document.getElementById('status-info');
  if (statusInfo) {
    statusInfo.textContent = '正在监听页面变化...';
  }
  
  // 监听DOM变化，寻找考勤相关的元素
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 检查是否添加了考勤相关的元素
          if (node.querySelector && (
            node.querySelector('[data-attendance]') ||
            node.querySelector('.attendance') ||
            node.querySelector('[class*="attendance"]')
          )) {
            console.log('🎯 DOM监听检测到考勤元素');
            statusInfo.textContent = '检测到考勤页面元素，请手动刷新数据...';
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ DOM监听已启动');
}

// 检测当前环境并初始化UI
const environment = detectEnvironment();
if (environment === 'main') {
  console.log('🏠 主页面环境，创建面板并自动启动拦截器');
  
  // 改进的初始化逻辑
  function initializeMainPage() {
    console.log('📄 开始主页面初始化');
    createPanel();
    
    // 使用改进的初始化策略
    setTimeout(() => {
      autoStartInterceptor();
    }, 1500); // 增加等待时间确保页面完全加载
  }
  
  // 等待DOM加载后创建面板
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 DOM加载完成，开始初始化');
      initializeMainPage();
    });
  } else {
    console.log('📄 DOM已加载，直接初始化');
    initializeMainPage();
  }
} else if (environment === 'iframe') {
  console.log('🖼️ iframe环境，无需创建面板');
  
  // iframe环境也尝试初始化拦截器
  setTimeout(() => {
    console.log('🖼️ iframe环境初始化拦截器');
    initializeWithRetry();
  }, 1000);
} else {
  console.log('❓ 未知环境，仅设置拦截器');
  
  // 未知环境也尝试初始化
  setTimeout(() => {
    console.log('❓ 未知环境初始化拦截器');
    initializeWithRetry();
  }, 1000);
}
