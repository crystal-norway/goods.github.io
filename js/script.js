document.addEventListener('DOMContentLoaded', function () {
    loadEvents();
    loadAnnouncement();
    updateTime();
    // 初始化状态机
    const stateMachine = {
        state: 'idle',
        actions: {
            
            study: handleStudyEvent // 可以继续添加其他动作
        },
        transition(action, params) {
            if (this.actions[action]) {
                this.actions[action](params); // 传递参数以执行对应的操作
            } else {
                console.log(`未处理的动作: ${action}`);
            }
        }
    };
    // 处理学习事件的函数
    function handleStudyEvent(params) {
        const { eventName, note } = params;
        handleEvent(eventName || "学习", note || "默认为学习"); // 默认值
    }
    // 示例: 从 URL 中获取 action、eventName 和 note，并调用 transition 方法
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action') || 'study'; // 默认动作为 study
    const eventName = urlParams.get('eventName'); // 获取 eventName 参数
    const note = urlParams.get('note'); // 获取 note 参数
    const params = { eventName, note }; // 包含 eventName 和 note 的参数对象
    stateMachine.transition(action, params); // 调用状态机的转移方法
    


    // 添加事件按钮点击事件
    document.getElementById('addEventButton').addEventListener('click', function () {
        const eventName = prompt('请输入事件名称:');
        if (eventName) {
            const note = prompt('请输入备注:');
            handleEvent(eventName, note);
        }
    });

    // 清除所有事件数据
    document.getElementById('clearAllButton').addEventListener('click', function () {
        localStorage.clear();
        location.reload();
    });

    // 导出事件数据到CSV
    document.getElementById('exportButton').addEventListener('click', exportDataToCSV);

    function handleEvent(eventName, note) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const currentEvent = events.find(event => event.isRunning); // 查找正在进行的事件
        const now = new Date().getTime();

        if (currentEvent) { // 如果有正在进行的事件，结束它
            currentEvent.endTime = now;
            currentEvent.isRunning = false;
            currentEvent.timeDiff = (currentEvent.endTime - currentEvent.startTime) / 1000;
            saveEvent(currentEvent);
            alert(`事件 "${currentEvent.eventName}" 已结束。`);
        }

        // 开始新的事件
        const newEvent = {
            eventName,
            startTime: now,
            isRunning: true,
            note,
            endTime: null,
            timeDiff: null
        };
        saveEvent(newEvent);
        loadEvents(); // 刷新事件显示
    }

    function loadEvents() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        document.getElementById('eventsContainer').innerHTML = ''; // 清空当前事件显示

        events.forEach((event) => {
            const eventContainer = document.createElement('div');
            eventContainer.className = 'event';
            eventContainer.innerHTML = `
                <div>事件名称: <span class="event-name">${event.eventName}</span></div>
                <div>备注: <span class="event-note">${event.note}</span></div>
                <div>开始时间: ${formatDateTime(event.startTime)}</div>
                ${event.isRunning ? '' : `<div>结束时间: ${formatDateTime(event.endTime)}</div>`}
                ${event.timeDiff ? `<div>持续时间: ${formatTimeDiff(event.timeDiff)}</div>` : ''}
                <button class="edit-button">✏️</button>
                <button class="delete-button">✖</button>
            `;
            document.getElementById('eventsContainer').appendChild(eventContainer);

            // 编辑按钮事件
            eventContainer.querySelector('.edit-button').addEventListener('click', function () {
                showDateTimeEditor(event.eventName, event.note, new Date(event.startTime), new Date(event.endTime), (newEventName, newNote, newStartTime, newEndTime) => {
                    event.eventName = newEventName;
                    event.note = newNote;
                    event.startTime = newStartTime.getTime();
                    event.endTime = newEndTime ? newEndTime.getTime() : null; // 确保结束时间可以为 null
                    event.isRunning = false; // 更新为不在进行中
                    event.timeDiff = event.endTime ? (event.endTime - event.startTime) / 1000 : null; // 计算持续时间
                    saveEvent(event);
                    loadEvents(); // 刷新事件显示
                });
            });

            // 删除按钮事件
            eventContainer.querySelector('.delete-button').addEventListener('click', function () {
                removeEvent(event.startTime);
                loadEvents(); // 刷新事件显示
            });
        });
    }

    function showDateTimeEditor(eventName, note, start, end, callback) {
        const editor = document.getElementById('datetime-editor');

        // 检查元素是否存在
        if (editor) {
            document.getElementById('edit-event-name').value = eventName;

            const editNoteInput = document.getElementById('edit-note');
            if (editNoteInput) {
                editNoteInput.value = note;
            }

            document.getElementById('start-year').value = start.getFullYear();
            document.getElementById('start-month').value = start.getMonth() + 1;
            document.getElementById('start-day').value = start.getDate();
            document.getElementById('start-hour').value = start.getHours();
            document.getElementById('start-minute').value = start.getMinutes();
            document.getElementById('start-second').value = start.getSeconds();

            if (end) {
                document.getElementById('end-year').value = end.getFullYear();
                document.getElementById('end-month').value = end.getMonth() + 1;
                document.getElementById('end-day').value = end.getDate();
                document.getElementById('end-hour').value = end.getHours();
                document.getElementById('end-minute').value = end.getMinutes();
                document.getElementById('end-second').value = end.getSeconds();
            }

            editor.style.display = 'block';

            // 保存时间按钮事件
            document.getElementById('save-datetime').onclick = function () {
                const newEventName = document.getElementById('edit-event-name').value;
                const newNote = editNoteInput.value;

                const newStartYear = document.getElementById('start-year').value;
                const newStartMonth = document.getElementById('start-month').value - 1;
                const newStartDay = document.getElementById('start-day').value;
                const newStartHour = document.getElementById('start-hour').value;
                const newStartMinute = document.getElementById('start-minute').value;
                const newStartSecond = document.getElementById('start-second').value;

                const newEndYear = document.getElementById('end-year').value;
                const newEndMonth = document.getElementById('end-month').value - 1;
                const newEndDay = document.getElementById('end-day').value;
                const newEndHour = document.getElementById('end-hour').value;
                const newEndMinute = document.getElementById('end-minute').value;
                const newEndSecond = document.getElementById('end-second').value;

                const newStartTime = new Date(newStartYear, newStartMonth, newStartDay, newStartHour, newStartMinute, newStartSecond);
                const newEndTime = new Date(newEndYear, newEndMonth, newEndDay, newEndHour, newEndMinute, newEndSecond);

                // 输入合法性检查
                if (!isNaN(newStartTime.getTime()) && (newEndTime ? !isNaN(newEndTime.getTime()) : true) && newStartTime <= (newEndTime || new Date())) {
                    callback(newEventName, newNote, newStartTime, newEndTime);
                    editor.style.display = 'none';
                } else {
                    alert('无效的时间输入或开始时间大于结束时间！');
                }
            };
        } else {
            console.error('未找到 datetime-editor 元素');
        }
    }

    function formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString(); // 使用本地时间格式
    }

    function formatTimeDiff(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function saveEvent(event) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const eventIndex = events.findIndex(e => e.startTime === event.startTime);
        if (eventIndex > -1) {
            events[eventIndex] = event; // 更新已存在的事件
        } else {
            events.push(event); // 添加新事件
        }
        localStorage.setItem('events', JSON.stringify(events));
        console.log('事件已保存:', event);
    }

    function removeEvent(startTime) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.filter(event => event.startTime !== startTime);
        localStorage.setItem('events', JSON.stringify(events));
        console.log('事件已删除:', startTime);
    }

    function loadAnnouncement() {
        const announcement = localStorage.getItem('announcement');
        if (announcement) {
            document.getElementById('announcedData').innerText = announcement;
        }
    }

    function updateTime() {
        setInterval(() => {
            const now = new Date();
            document.getElementById('currentTime').innerText = formatDateTime(now.getTime());
        }, 1000);
    }

    function exportDataToCSV() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        if (events.length === 0) {
            alert('没有可导出的事件数据');
            return;
        }

        const csvContent = `事件名称,备注,开始时间,结束时间,持续时间\n` +
            events.map(event => `${event.eventName},${event.note},${formatDateTime(event.startTime)},${event.isRunning ? '' : formatDateTime(event.endTime)},${event.isRunning ? '' : formatTimeDiff(event.timeDiff || 0)}`).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `events_${new Date().toISOString().substring(0, 10)}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
