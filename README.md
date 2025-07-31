Author(s): Justin Bell
June 2025
Version 1; rough but working

This application is my first ever web development project. This is the Justin Inventory System Tool (JIST).
The system allows a person the search for and use inventory items. Supporting stuctures are also in place like location managment and categories for item filtering.
Items can also be "live edited" meaning a person change update item information like location, name, photo etc.
Possibly the my faorite feature is the picklist.
The picklist can take an excel sheet (properly formatted) and pull items and quanties to make a list for gathering items for a build.
    "Proper" formatting is simply having a sheet named "JIST" with two columns: barcode, quantity.
A picklist can also be made from the search tab by finding items one at a time.
JIST currently is only html and javascript so a more expirenced web developer should add a framework and php.
php will be nessicary for when users are implemented and/or if the system gets a domain and is live on the web.

Known issues:
    search is slow - maybe a javascript throttle, maybe an sql performance issue? i dont really know 
    edit item is slow to auto fill as i am buffering location fetches as the parent has to load before the child ex: site must load before room.
    currently no character escaping so that might cause problems down the road 
    cybersecurity is basically nothing, no protections on the server or in the code from attacks

# JIS
