//searches for a category by name, returns a true or false
function searchCategory(name) {
    const safeName = encodeURIComponent(name?.trim());
    return fetch(`/api/category-exists?name=${safeName}`)
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
    })
    .then(data => {
        console.log('API response:', data);
        return data.exists;
    })
    .catch(err => {
        console.error('searchCategory error:', err);
        return false;
    });
}

//adds new category to database returns a true or false for saved status
function addCategory(name) {
    return fetch('/api/add-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }).then(res => res.json());
}

//deletes the category from database returns a true or false for status
function deleteCategory(name) {
    return fetch('/api/delete-category', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }).then(res => res.json());
}

window.manipulateCategory = function manipulateCategory () {
    const add = document.querySelector('input[name="actionType"][value="add"]');
    const remove = document.querySelector('input[name="actionType"][value="remove"]');
    const name = document.getElementById('categoryName');
    const submit = document.getElementById('ecsubmit');

    if (submit) {
        submit.addEventListener('click', function(e) {
            e.preventDefault();
            if (!name) {
                alert('Please enter a category name.');
                return;
            }
            if (add && add.checked) {
                searchCategory(name.value).then(exists => {
                    if (exists) {
                        alert('Category already exists.');
                    } else {
                        addCategory(name.value).then(result => {
                            if (result.success) {
                                alert('Category added!');
                            } else {
                                alert('Failed to add category.');
                            }
                        });
                    }
                });
            } else if (remove && remove.checked) {
                searchCategory(name.value).then(exists => {
                    console.log('Checking category:', name.value);
                    if (!exists) {
                        alert('Category not found.');
                    } else {
                        deleteCategory(name.value).then(result => {
                            if (result.success) {
                                alert('Category deleted!');
                            } else {
                                alert('Failed to delete category.');
                            }
                        });
                    }
                });
            }
        });
    }
}