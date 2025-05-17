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

## Updating an existing incomplete history record or creating a new completed one
```javascript
// When the user completes a game, this will either:
// 1. Find an incomplete history for this user and game type and update it, or
// 2. Create a new completed history record if no incomplete record exists
fetch('/api/history', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    gameTypeId: 1,
    regionId: 2,
    description: "User completed a quiz about Vietnamese culture",
    started_time: new Date(Date.now() - 300000).toISOString(), // Only used if creating new
    completed: true,  // This flag tells the API to look for incomplete history
    completed_time: new Date().toISOString() // Optional - current time will be used if not provided
  }),
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  console.log('History completed:', data);
})
.catch(error => console.error('Error completing history:', error));
```

## Updating completed_time for a specific history record
```javascript
// When you know the exact history ID to update
fetch(`/api/history/${historyId}/complete`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    completed_time: new Date().toISOString()
  }),
  credentials: 'include'
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
fetch('/api/history/user/:userId', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  console.log('User history:', data);
})
.catch(error => console.error('Error fetching user history:', error));
```
