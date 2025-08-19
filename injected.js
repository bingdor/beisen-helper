// 注入到页面环境的拦截器脚本
(function() {
  console.log('📄 [注入脚本] 在页面环境中设置fetch拦截器...');
  
  // 检查是否已经注入过
  if (window.__attendanceInterceptorActive__) {
    console.log('📄 [注入脚本] 拦截器已存在，跳过重复注入');
    return;
  }
  
  // 保存当前的fetch函数
  const originalFetch = window.fetch;
  console.log('📊 [注入脚本] 页面环境fetch函数信息:');
  console.log('  - 长度:', originalFetch.toString().length);
  console.log('  - 预览:', originalFetch.toString().substring(0, 200) + '...');
  
  // 目标API检测函数
  function isTargetAttendanceAPI(url) {
    if (!url || typeof url !== 'string') return false;
    
    const keywords = [
      'Attendance.SingleObjectListView.EmpAttendanceDataList',
      'Attendance.SingleObjectListView.EmpAttendanceDataLis',
      'Attendance.AttendanceStatistics',
      'Attendance.AttendanceDataRecordNavView',
      'attendance',
      'Attendance'
    ];
    
    const apiPaths = [
      'api/v2/UI/TableList',
      'api/attendance',
      'api/v2/attendance'
    ];
    
    return keywords.some(keyword => url.includes(keyword)) || 
           apiPaths.some(path => url.includes(path));
  }
  
  // 设置新的fetch拦截器
  window.fetch = async function(resource, options) {
    console.log('🌐 [注入脚本] fetch被调用:', resource);
    
    const requestUrl = typeof resource === 'string' ? resource : (resource.url || '');
    
    // 记录所有API请求
    if (requestUrl.includes('/api/')) {
      console.log('📡 [注入脚本] 拦截到API请求:', requestUrl);
    }
    
    // 检查是否是目标考勤请求
    if (isTargetAttendanceAPI(requestUrl)) {
      console.log('🎯 [注入脚本] 拦截到目标考勤请求:', requestUrl);
      
      // 通过自定义事件通知content script
      try {
        window.dispatchEvent(new CustomEvent('attendanceApiDetected', {
          detail: { url: requestUrl, options: options }
        }));
      } catch (eventError) {
        console.log('📄 [注入脚本] 事件发送失败:', eventError.message);
      }
    }
    
    try {
      // 调用原始fetch函数
      const response = await originalFetch.call(this, resource, options);
      
      // 处理目标请求的响应
      if (isTargetAttendanceAPI(requestUrl)) {
        // 克隆响应用于处理
        const clonedResponse = response.clone();
        
        // 安全解析响应数据
        clonedResponse.text().then(text => {
          console.log('📥 [注入脚本] 获取响应文本，长度:', text.length);
          
          try {
            // 尝试解析为JSON
            const data = JSON.parse(text);
            console.log('📥 [注入脚本] 成功解析考勤数据:', data);
            
            // 通过自定义事件发送数据给content script
            try {
              window.dispatchEvent(new CustomEvent('attendanceDataReceived', {
                detail: { url: requestUrl, data: data }
              }));
            } catch (eventError) {
              console.log('📄 [注入脚本] 数据事件发送失败:', eventError.message);
            }
          } catch (parseErr) {
            console.log('📥 [注入脚本] JSON解析失败，原始数据:', text.substring(0, 200) + '...');
            console.log('📥 [注入脚本] 解析错误:', parseErr.message);
            
            // 如果不是JSON，也发送原始文本数据
            try {
              window.dispatchEvent(new CustomEvent('attendanceDataReceived', {
                detail: { url: requestUrl, data: { raw_text: text } }
              }));
            } catch (eventError) {
              console.log('📄 [注入脚本] 原始数据事件发送失败:', eventError.message);
            }
          }
        }).catch(err => {
          console.log('📥 [注入脚本] 读取响应文本失败:', err);
        });
      }
      
      return response;
    } catch (error) {
      console.error('❌ [注入脚本] fetch请求失败:', error);
      throw error;
    }
  };
  
  console.log('✅ [注入脚本] fetch拦截器设置完成');
  
  // 标记拦截器已设置
  window.__attendanceInterceptorActive__ = true;
  
  // 添加重试机制，确保拦截器正常工作
  setTimeout(() => {
    if (!window.__attendanceInterceptorActive__) {
      console.log('🔄 [注入脚本] 检测到拦截器未激活，重新设置...');
      // 重新设置拦截器
      window.__attendanceInterceptorActive__ = true;
    }
  }, 3000);
  
  // 监听页面卸载，清理标记
  window.addEventListener('beforeunload', () => {
    console.log('📄 [注入脚本] 页面即将卸载，清理标记');
    delete window.__attendanceInterceptorActive__;
  });
})();
