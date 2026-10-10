function AddNewItem() {
    /*
    Creates a new item and appends to the users current list
    */
}

function GetItem(element) {
    /*
    Fetches the list item that this element belongs to
    :element - Any html element
    :returns - If :element belongs to a list item, returns that item
             - If :element does not belong to a list item, returns null
    */

    let elementParent = element.closest('.list-item');

    if (elementParent == null) {
        return null;
    }
    else {
        return elementParent;
    }
}

function SelectItem(listItem) {
    /*
    Selects the list item to edit or save
    :listItem - Any html element
    */

    // If the provided element isnt correct find the closest correct one
    if (!listItem.classList.contains('list-item')) {
        listItem = GetItem(listItem);
    }
    if (listItem == null) {
        ErrorLog('List Item Not Found');
        return null;
    }

    let itemName = listItem.querySelector('.list-item-name');
    let itemDesc = listItem.querySelector('.list-item-desc');

    // Switch to editing mode
    if (listItem.dataset.mode == 'normal') {
    }

    // Save the item and swtich to normal
    else if (listItem.dataset.mode == 'editing') {

    }
    Log('\nName: ' + itemName.innerHTML + '\nDesc: ' + itemDesc.innerHTML);
}