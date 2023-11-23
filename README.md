# Application Info:
    Project Name : Warehouse Management System
    Group Member : 
        Full Name : CHAN Man Kit 
        Student ID : 13204789

# Operation Guides:
## The server provides Login/Logout pages for users
The system's management page will redirect to the login interface if you are not logged in.

Testing method(Login) : Login By Following Account which store in MongoDB. 
```
AccountID : (removed part, please contact me to get the AccountID)
Password : (removed part, please contact me to get the Password)
```
```
AccountID : (removed part, please contact me to get the AccountID)
Password : (removed part, please contact me to get the Password)
```

This will also store session data(including userID) in cookies to achieve the login effect. You can see the userID is show on top of main page to prove it work.


Testing method(Logout) :
There is a logout button in the lower right corner of the main page. This button will delete the session data stored in cookies to achieve the logout effect.

## The server provides basic CRUD services for the app. 

Create new data objects or documents:

    Users can see the "+" button in the lower right corner of the main page. This button will open a new window, allowing users to easily add new product to MongoDB and display them on the page.
    
Update data objects or documents:

    Users can see current product information in the middle right half of the main page, and there is an edit button on the right side of each product.
    The button will open a page similar to the one for adding new products. The difference is that the product information has been filled in. The user only needs to update the specified items and then submit to complete the update of product information.

Delete inventory documents:

    Below the edit button, there is a delete button. Clicking the button will request the user's confirmation. Only after confirmation will the product information be actually deleted from mongoDB.
    
Search data by some query conditions:

    On the left side of the page, there is a filtering area where users can filter by product ID, Name, Description, Category, Price.
    
## The server provides RESTful services.
    > Notice: Except for the API of login, authorization is required.


### /login : 
        This API endpoint is used to perform a login operation. It sends an HTTP POST request to the /login.
        
        Request Headers:
            Content-Type : application/x-www-form-urlencoded
            body : 
                username
                password

        Response:
            The response received from the last execution of this request had a status code of 200.

### /addProduct :
                This API endpoint allows you to add a new product to the system. To add a product, you need to send an HTTP POST request
                
                Request Parameters:
                    name (string): The name of the product.
                    price (number): The price of the product.
                    description (string): A description of the product.
                    category(string): Category of the product.
                    imageUrl[Optional](string): ImageUrl of the product.

                Response:
                    The API will respond with a status code of 200 if the product was successfully added.

                    If there was an error during the request, the API may respond with a different status code and an error message in the response body.

### /getProducts :
The request is sent as an HTTP POST to the URL /getProducts with two query parameters: by and query. The by parameter is used to specify the search criteria, and the query parameter is used to provide the search term.

Request Parameters:
    by(string) : search product by a method(name, description, price, category, imageUrl)
    
query(string) : input of query

Response:
    The last execution of this request returned a response with a status code of 200. The response body contains a JSON object with the following structure:
```     
        {
            "status": "",
            "Products": [
                {
                "_id": "",
                "name": "",
                "description": "",
                "price": 0,
                "category": "",
                "imageUrl": ""
                }
            ]
        }
```   
```
    _id: The unique identifier of the product.
    name: The name of the product.
    description: The description of the product.
    price: The price of the product.
    category: The category of the product.
    imageUrl: The URL of the product image.
```

### /editProduct :
This API endpoint allows you to edit a product by sending an HTTP POST request to the specified URL. The request should include the target parameter in the query string, which should be set to the ID of the product you want to edit.

    Request Parameters:
        target: The ID of the product to be edited.

    Request Headers:
        Content-Type : application/x-www-form-urlencoded
                body : 
                    name: The name of the product.
                    description: The description of the product.
                    price: The price of the product.
                    category: The category of the product.
                    imageUrl: The URL of the product image.

### /removeProduct :
This HTTP POST request is used to remove a product from the server. The target parameter in the request URL specifies the ID of the product to be removed.

    Request Parameters:
        target: The ID of the product to be removed.

    Response:
        The response will have a status code of 200 if the product is successfully removed. 
        

The following is the web version for testing.
    https://s381f-project-databasewebui.onrender.com/
