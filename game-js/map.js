  const query = new URLSearchParams(window.location.search);
        const currentCourse = query.get('course') || 'cpp';
        
        const gameUrls = {
            cpp: '../game-pages/c++.html',
            java: '../game-pages/java.html',
            html: '../game-pages/html.html',
            css: '../game-pages/css.html',
            boss: '../game-pages/last.html'
        };
        
        // Check which levels are unlocked based on stored progress
        const progressData = JSON.parse(localStorage.getItem('lastProgressData') || 'null');
        const completedCourses = new Set();
        
        // Get all stored progress data (we might have multiple)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('ProgressData')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.lessonId) {
                        completedCourses.add(data.lessonId);
                    }
                } catch (e) {}
            }
        }
        
        // If we have current progress data, add it
        if (progressData && progressData.lessonId) {
            completedCourses.add(progressData.lessonId);
        }
        
        // Update level states
        const levels = ['cpp', 'java', 'html', 'css'];
        levels.forEach((course, index) => {
            const levelEl = document.getElementById(`level-${course}`);
            const isCompleted = completedCourses.has(course);
            const isCurrent = course === currentCourse;
            
            if (isCompleted) {
                levelEl.classList.add('unlocked');
                levelEl.classList.remove('locked');
            } else if (isCurrent) {
                levelEl.classList.add('current');
                levelEl.classList.remove('locked');
            } else {
                levelEl.classList.add('locked');
            }
        });
        
        // Boss level - unlock if all levels completed
        const bossEl = document.getElementById('level-boss');
        const allCompleted = levels.every(course => completedCourses.has(course));
        if (allCompleted) {
            bossEl.classList.remove('locked');
        } else {
            bossEl.classList.add('locked');
        }
        
        function launchGame(course) {
            const levelEl = document.getElementById(`level-${course}`);
            if (levelEl.classList.contains('locked')) {
                alert('This region is locked! Complete the previous quests to unlock it.');
                return;
            }
            
            const url = gameUrls[course];
            if (url) {
                window.location.href = url;
            }
        }
        
        // Add click handlers for locked levels
        document.querySelectorAll('.level.locked').forEach(el => {
            el.onclick = function() {
                alert('This region is locked! Complete the previous quests to unlock it.');
            };
        });