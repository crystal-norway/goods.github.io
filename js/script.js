document.addEventListener('DOMContentLoaded', function () {
    loadEvents();
    loadAnnouncement();
    updateTime();

    document.getElementById('addEventButton').addEventListener('click', function () {
        const eventName = prompt('请输入事件名称:');
        if (eventName) {
            const note = prompt('请输入备注:');
            handleEvent(eventName, note);
        }
    });

    document.getElementById('clearAllButton').addEventListener('click', function () {
        localStorage.clear();
        location.reload();
    });

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
                <button class="edit-button">编辑</button>
                <button class="delete-button">✖</button>
            `;
            document.getElementById('eventsContainer').appendChild(eventContainer);

            eventContainer.querySelector('.edit-button').addEventListener('click', function () {
                editEvent(event);
            });

            eventContainer.querySelector('.delete-button').addEventListener('click', function () {
                removeEvent(event.startTime);
                loadEvents(); // 刷新事件显示
            });
        });
    }

    function editEvent(event) {
        const newName = prompt('修改事件名称:', event.eventName);
        const newNote = prompt('修改备注:', event.note);
        if (newName !== null || newNote !== null) {
            event.eventName = newName !== null ? newName : event.eventName;
            event.note = newNote !== null ? newNote : event.note;
            saveEvent(event);
            loadEvents(); // 刷新事件显示
        }
    }

    function formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toISOString().slice(0, 19).replace('T', ' ');
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
