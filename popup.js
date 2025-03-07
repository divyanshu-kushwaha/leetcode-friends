document.getElementById('addFriend').addEventListener('click', () => {
    const username = document.getElementById('friendUsername').value.trim();
    if (username) {
      chrome.storage.sync.get('friends', (data) => {
        const friends = data.friends || [];
        if (!friends.includes(username)) {
          friends.push(username);
          chrome.storage.sync.set({ friends }, () => {
            updateFriendList(friends);
            document.getElementById('friendUsername').value = '';
          });
        }
      });
    }
  });
  
  function updateFriendList(friends) {
    const list = document.getElementById('friendList');
    list.innerHTML = '';
    friends.forEach(friend => {
      const li = document.createElement('li');
      li.textContent = friend;
      list.appendChild(li);
    });
  }
  
  // Load friends on popup open
  chrome.storage.sync.get('friends', (data) => {
    updateFriendList(data.friends || []);
  });