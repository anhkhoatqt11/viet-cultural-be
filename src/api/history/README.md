# History API Usage Examples

## Creating a new history record
```javascript
// Create a new history record for a game start
fetch('/api/history', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    gameTypeId: 1,  // ID of the game type (e.g., puzzle, quiz, word)
    regionId: 2,    // ID of the region (e.g., North, Central, South Vietnam)
    description: "User started a quiz about Vietnamese culture",
    started_time: new Date().toISOString()
    // No completed field - history is created without completion
  }),
  credentials: 'include' // Important: to include the authentication cookie
})
.then(response => response.json())
.then(data => {
  console.log('History created:', data);
  // Store the history ID for later updating when the game is completed
  const historyId = data.id;
})
.catch(error => console.error('Error creating history:', error));
```

## Creating a history record and marking it as completed in one call
```javascript
// Create a history record and mark it as completed
fetch('/api/history', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    gameTypeId: 1,
    regionId: 2,
    description: "User completed a quiz about Vietnamese culture",
    started_time: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    completed: true,  // This flag tells the API to mark the history as completed
    completed_time: new Date().toISOString() // Optional - current time will be used if not provided
  }),
  credentials: 'include' // Important: to include the authentication cookie
})
.then(response => response.json())
.then(data => {
  console.log('History created and completed:', data);
})
.catch(error => console.error('Error creating and completing history:', error));
```

## Updating completed_time when a game is finished
```javascript
// When the game is completed, update the history record
fetch(`/api/history/${historyId}/complete`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    completed_time: new Date().toISOString()
  }),
  credentials: 'include' // Important: to include the authentication cookie
})
.then(response => response.json())
.then(data => {
  console.log('History completed:', data);
})
.catch(error => console.error('Error completing history:', error));
```

## Getting history for the current user
```javascript
// Get all history records for the current authenticated user
fetch('/api/history/current-user', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include' // Important: to include the authentication cookie
})
.then(response => response.json())
.then(data => {
  console.log('User history:', data);
})
.catch(error => console.error('Error fetching user history:', error));
```
