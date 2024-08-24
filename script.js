document.getElementById('addEventButton').addEventListener('click', function() {
    // 创建新的事件容器
    const eventContainer = document.createElement('div');
    eventContainer.className = 'event';
    
    // 创建开始按钮
    const startButton = document.createElement('button');
    startButton.innerText = '开始';
    eventContainer.appendChild(startButton);
    
    // 创建显示时间差的span
    const timeDiffSpan = document.createElement('span');
    timeDiffSpan.style.marginLeft = '10px';
    eventContainer.appendChild(timeDiffSpan);
    
    // 将新事件容器添加到页面
    document.getElementById('eventsContainer').appendChild(eventContainer);
    
    let startTime;
    
    startButton.addEventListener('click', function() {
        if (startButton.innerText === '开始') {
            // 记录开始时间
            startTime = new Date();
            startButton.innerText = '结束';
        } else if (startButton.innerText === '结束') {
            // 计算时间差
            const endTime = new Date();
            const timeDiff = (endTime - startTime) / 1000; // 以秒为单位的时间差
            timeDiffSpan.innerText = `时间差: ${timeDiff} 秒`;
            startButton.disabled = true; // 禁用按钮以防止重复点击
        }
    });
});
