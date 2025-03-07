chrome.storage.sync.get('friends', (data) => {
    const friends = data.friends || [];
    if (friends.length > 0) {
        fetchFriendsContestRatings(friends).then(friendsWithRatings => {
            // Sort friends by rating (descending order)
            friendsWithRatings.sort((a, b) => {
                if (a.rating === 'N/A') return 1; // Put 'N/A' at the end
                if (b.rating === 'N/A') return -1; // Put 'N/A' at the end
                return b.rating - a.rating; // Sort by rating (highest first)
            });
            injectFriendsSection(friendsWithRatings);
        });
    }
});

async function fetchFriendsContestRatings(friends) {
    const friendsWithRatings = [];
    for (const friend of friends) {
        try {
            const response = await fetch(`https://leetcode.com/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        query getUserProfile($username: String!) {
                            matchedUser(username: $username) {
                                profile {
                                    userAvatar
                                }
                            }
                            userContestRanking(username: $username) {
                                rating
                            }
                        }
                    `,
                    variables: {
                        username: friend,
                    },
                }),
            });
            const result = await response.json();
            const rating = result.data?.userContestRanking?.rating?.toFixed(0) || 'N/A';
            const profilePic = result.data?.matchedUser?.profile?.userAvatar || 'https://example.com/default-avatar.png'; // Default avatar if not found
            friendsWithRatings.push({ username: friend, rating: parseFloat(rating) || 'N/A', profilePic });
        } catch (error) {
            console.error(`Failed to fetch contest rating for ${friend}:`, error);
            friendsWithRatings.push({ username: friend, rating: 'N/A', profilePic: 'https://example.com/default-avatar.png' });
        }
    }
    return friendsWithRatings;
}

function injectFriendsSection(friendsWithRatings) {
    // Adjust selector based on LeetCode's actual DOM structure
    const profileContainer = document.querySelector('.container') || document.body;
    if (!profileContainer) return;

    const friendsDiv = document.createElement('div');
    friendsDiv.style.marginTop = '650px';
    friendsDiv.style.marginLeft = '115px';
    friendsDiv.style.width = '300px';
    friendsDiv.style.padding = '20px';
    friendsDiv.style.backgroundColor = '#fff';
    friendsDiv.style.border = '1px solid #e0e0e0';
    friendsDiv.style.borderRadius = '8px';
    friendsDiv.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    friendsDiv.innerHTML = `
      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">My LeetCode Friends</h3>
      <ul style="list-style: none; padding: 0; margin: 0; height: 250px; overflow-y: auto;">
        ${friendsWithRatings.map(friend => `
          <li style="margin: 10px 0; padding: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">
            <img src="${friend.profilePic}" alt="${friend.username}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px; vertical-align: middle;">
            <a href="https://leetcode.com/u/${friend.username}/" target="_blank" style="text-decoration: none; color: #0078d4; font-size: 14px;">${friend.username}</a>
            <span style="float: right; color: #666; font-size: 14px;">${friend.rating}</span>
          </li>
        `).join('')}
      </ul>
    `;

    // Find a suitable location to insert the friends section
    const existingSections = profileContainer.querySelectorAll('.section');
    if (existingSections.length > 0) {
        profileContainer.insertBefore(friendsDiv, existingSections[0]);
    } else {
        profileContainer.appendChild(friendsDiv);
    }
}