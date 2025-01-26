const RESTDB_LISTINGS_URL = 'https://mokesellcustomers-cfe3.restdb.io/rest/listings';
const API_KEY = '677f31d996bc7400895f1141';

async function handleListingSubmit(event) {
    event.preventDefault(); 

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;
    const condition = document.getElementById('condition').value;

    try {
        const response = await fetch(RESTDB_LISTINGS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': API_KEY
            },
            body: JSON.stringify({
                title,
                description,
                category,
                price,
                condition
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create listing: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        alert("Listing created successfully: " + JSON.stringify(result));
        document.getElementById('listingForm').reset();
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred: " + error.message);
    }
}
async function handledeletereqSubmit(event) {
    event.preventDefault(); 

    const ListingID = document.getElementById('ListingID').value.trim(); 

    if (!ListingID) {
        alert("Please provide a valid Listing ID.");
        return;
    }

    try {
        
        const deleteUrl = `${RESTDB_LISTINGS_URL}?q={"listingID":"${ListingID}"}`;

        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete listing: ${response.status} ${response.statusText}`);
        }

        alert("Listing deleted successfully.");
        document.getElementById('listingdeleteForm').reset(); 
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the listing: " + error.message);
    }
}
async function handleModifySubmit(event) {
    event.preventDefault();

    const listingID = document.getElementById('ListingID').value.trim();
    const title = document.getElementById('newTitle').value.trim();
    const description = document.getElementById('newDescription').value.trim();
    const price = parseFloat(document.getElementById('newPrice').value.trim());
    const category = document.getElementById('newCategory').value.trim();
    const condition = document.getElementById('newCondition').value.trim();

    if (!listingID) {
        alert("Please provide a valid Listing ID.");
        return;
    }

    try {
        const queryUrl = `${RESTDB_LISTINGS_URL}?q=${encodeURIComponent(JSON.stringify({ listingID: parseInt(listingID) }))}`;
        const queryResponse = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': API_KEY
            }
        });

        if (!queryResponse.ok) {
            throw new Error(`Failed to query listing: ${queryResponse.status} ${queryResponse.statusText}`);
        }

        const queryResult = await queryResponse.json();
        if (queryResult.length === 0) {
            alert("No listing found with the specified ID.");
            return;
        }

        const recordId = queryResult[0]._id;

        const modifyUrl = `${RESTDB_LISTINGS_URL}/${recordId}`;
        const modifyResponse = await fetch(modifyUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': API_KEY
            },
            body: JSON.stringify({
                title,
                description,
                price,
                category,
                condition
            })
        });

        if (!modifyResponse.ok) {
            throw new Error(`Failed to modify listing: ${modifyResponse.status} ${modifyResponse.statusText}`);
        }

        const result = await modifyResponse.json();
        alert("Listing modified successfully: " + JSON.stringify(result));

        document.getElementById('listingForm').reset();
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while modifying the listing: " + error.message);
    }
}
