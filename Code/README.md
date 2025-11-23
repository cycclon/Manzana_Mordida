# Overview
- Each microservice has swagger notation for documentation, for you to learn how to use each endpoint.
- User interface language: Spanish
- Use icons whenever possible to make the interface friendlier
- All prices must be shown in us dollars and Argentine pesos. The value in dollars must look bigger visually. You can get the exchange rate from this third-party API: https://dolarapi.com/v1/dolares/blue (use the “venta” value to convert dollars to Argentine pesos and vice versa).
- If you need an endpoint that does not exist, don’t get limited. Tell me which one and I’ll create it after you create the front end.
- Authentication must be handled using msSeguridad microservice that uses JWT token.
- The app won’t handle payments itself, only the proof of payment document (upload) for reservations.
- I’m storing images for “equipos” in Cloudflare R2 service. Do something similar for payment proof documents that customers upload. 

# User types
- viewer: customer that browses products, requests appointments, makes reservations, etc. 
- Customer: is not a type of user but is linked to an existing viewer user. It’s registered using msClientes microservice right after creating the viewer user. 
- sales: sales representative that can handle stocks, confirm appointments or reservations, define available days and hours for client’s appointments
- admin: everything else related to the administration of the site: create, edit or delete products/devices, bank accounts, branches and all the same that the sales user can do.

The application should show different options according to the user type that is logged in.
If no user is logged in it should only show the functionality allowed by the “public” endpoints in the back end.

# Functionality:

## Main page
- Search engine for available products
- The user can specify what device he/she has (model, storage and battery health percentage) in the header of the page, which should be a sticky header, so that the user sees its device and its price all the time. The app automatically fetches the valuation given to that device and shows the prices of the devices available for sale, minus the value of the user’s device. Example: if the user has an iPhone 13 128 GB 85% valuated in 300 dollars, the search engine should only show devices better than the iPhone 13 128 GB and only the difference in price between both.
- If a device has a reservation, it should still be visible in the search engine but shown as unavailable, maybe with a “reserved” tag and/or icon.
- Each device shown in the search results should have buttons for showing more details, making a reservation (with down payment) and schedule an appointment to personally see the device in one of our offices (branches). 
- If the device has pictures they should be shown in a carousel style that the user can swipe.
- Important fields to show in the search results for each device: Model, storage, condition (A-; A; A+; Sealed; OEM, etc.), battery condition/health, price in dollars and pesos.

## Login/register/user page
- Single login page for all types of users.
- Registration page only for “viewers”. Admin or sales users must be created only by an admin.
- When a user is logged in, the app must show its name in the top right corner. If the user is of type viewer and clicks on its username, a new page is shown, giving the user the possibility to edit his/her data like phone number, email, etc. In this user page, the user can also see it’s appointments and reservations if any. If the user is of type admin or sales, it can only edit its password but should also be able to see its appointments on a calendar-like page.

## Products/devices
List of products and devices. (A device comes from a product created before). For example: Product: iPhone 16 Pro Max 256 GB -> device: iPhone 16 Pro Max 256gb Natural Titanium Sealed 1250 dollars.
It’s like classes and instances, think of it as the product is the class, and the device is an instance of that class.
- Add, edit or delete products or devices.

## Schedule
- Sales and admin users can set available days of the week and time windows in those days to receive appointments. For example: Sales user 1 set’s availability for all days except Sundays from 10 am to 1 pm and from 4 pm to 10 pm.
- A user of type viewer can request an appointment to visit the sales office. 
- The appointment must be requested at least 12 hours before. The user can select an available day, and time shown in a calendar-like page.
- The user of type sales or admin must confirm the appointment or send a reschedule to the viewer user.
- The app must send email notifications to both the viewer and the sales/admin users responsible for the appointment. The notifications must be sent whenever the appointment status changes and act as a reminder 3 hours before the appointment.
- Appointments should always be confirmed by admin or sales users. No automatic confirmation.

## Reservations
- A viewer user can make a reservation of a device of interest. Reservations must have a down-payment associated.
- Use case: a viewer sees a device of interest. The viewer clicks or touches the reserve button. The app shows the amount that the viewer must send for the down-payment and the bank accounts available to do it. The viewer must upload the document showing the bank transfer made (the viewer has only 1 hour to send the document after reserving a device). The admin or sales user must confirm the reservation after checking that the money is received in the bank accounts. Once the reservation is confirmed, the viewer has 7 days to complete the purchase, otherwise the down-payment is lost.
## Trade-ins
- Admin only
- List of devices that qualify for trade-in.
- Add, edit or delete trade in devices.
- When the admin adds a new trade in device he should specify: model, capacity, minimum battery health condition, maximum battery health condition and price. For example: iPhone 13 128 GB min 90% max 100%: 300 usd; iPhone 13 128 GB min 85% max 89%: 280 usd

## Bank accounts
- Admin only
- Simple list of bank accounts registered for down-payments or purchases. 
- Add, edit or delete bank accounts
- Send email notifications to all admins when a bank account is added, edited or deleted.

## Branches
- Admin only
- Simple list of business branches registered. 
- Add, edit or delete branches.
- Send email notifications to all admins when a branch is added, edited or deleted.