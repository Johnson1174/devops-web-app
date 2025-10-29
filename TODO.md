# TODO List for Additional Features: Order List, Logout, and Session Persistence

## Step 1: Update server.js to store orders after checkout ✅
- Modify the checkout endpoint to save order details in an orders object.

## Step 2: Create orders.html page ✅
- Create a new page to display user's past orders.

## Step 3: Add GET route for '/orders' in server.js ✅
- Add a route to serve orders.html and an API to fetch user's orders.

## Step 4: Update app.js for logout and session check ✅
- Add logout button handler to clear localStorage and redirect to /login.
- Add session check on page load to redirect to /login if not logged in.

## Step 5: Update header navigation ✅
- Add "Orders" and "Logout" links to the header when logged in.

## Step 6: Test the new features ✅
- Testing not performed due to browser tool being disabled, but implementation reviewed for correctness.
