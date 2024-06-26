document.addEventListener('DOMContentLoaded', function () {
    let groups;
    let disclaimer;

    // Fetch groups and disclaimer data
    fetch('groups.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            groups = data;
            console.log('Groups data loaded:', groups); // Debugging log
            initApp(); // Initialize the app after fetching groups data
        })
        .catch(error => console.error('Error fetching groups.json:', error));

    fetch('disclaimer.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            disclaimer = data.text;
            console.log('Disclaimer loaded:', disclaimer); // Debugging log
            document.querySelector('.content p').textContent = disclaimer;
        })
        .catch(error => console.error('Error fetching disclaimer.json:', error));

    let currentGroup = 'icon-d2-thermal';
    let currentProductType = 'oblc';
    const imageCache = {};
    const imageDisplay = document.getElementById('image-display');
    const slider = document.getElementById('slider');
    const title = document.getElementById('title');
    const productGrid = document.getElementById('product-grid');
    let currentImageIndex = 1; // Store the current slider position

    function initApp() {
        createGroupDropdown();
        createProductGrid();
        loadImages(currentProductType);
        updateTitle();

        // Update the image based on the slider value
        slider.addEventListener('input', (event) => {
            currentImageIndex = parseInt(event.target.value, 10); // Update the current image index
            imageDisplay.src = imageCache[currentImageIndex];
        });
    }

    function updateTitle() {
        const productLabel = groups[currentGroup].product[currentProductType].label;
        title.textContent = `${productLabel}`;
    }

    function generateImageUrls(group, productType) {
        const urls = [];
        const { serverUrl, product, urlPattern } = groups[group];
        const { step, extension, numberOfImages } = product[productType];
        for (let i = 0; i < numberOfImages; i++) {
            const imageIndex = i * step;
            const url = urlPattern
                .replace('${serverUrl}', serverUrl)
                .replace('${productType}', productType)
                .replace('${imageIndex}', imageIndex)
                .replace('${extension}', extension);
            urls.push(url);
        }
        return urls;
    }

    function preloadImages(imageUrls, initialImageIndex) {
        imageUrls.forEach((url, index) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                imageCache[index + 1] = img.src;
                if (index + 1 === initialImageIndex) {
                    // Set the initial image based on the slider position
                    imageDisplay.src = img.src;
                }
            };
        });
    }

    function createProductGrid() {
        productGrid.innerHTML = ''; // Clear existing grid items
        const product = groups[currentGroup].product;
        for (const key in product) {
            if (product.hasOwnProperty(key)) {
                const thumbnailIndex = product[key].thumbnailIndex;
                const thumbnailUrl = generateImageUrls(currentGroup, key)[thumbnailIndex];
                const gridItem = document.createElement('div');
                gridItem.className = 'product-grid-item';
                gridItem.innerHTML = `
                    <img src="${thumbnailUrl}" alt="${product[key].label}">
                    <div>${product[key].label}</div>
                `;
                gridItem.onclick = function () {
                    currentProductType = key;
                    loadImages(key);
                    updateTitle();
                };
                productGrid.appendChild(gridItem);
            }
        }
    }

    function createGroupDropdown() {
        const dropdownButton = document.querySelector('.dropbtn');
        dropdownButton.textContent = `${groups[currentGroup].label} ▼`; // Set the initial group name

        const dropdownContent = document.getElementById('group-dropdown-content');
        dropdownContent.innerHTML = ''; // Clear existing dropdown items
        for (const key in groups) {
            if (groups.hasOwnProperty(key)) {
                const group = groups[key];
                const dropdownItem = document.createElement('a');
                dropdownItem.href = '#';
                dropdownItem.textContent = group.label;
                dropdownItem.onclick = function () {
                    setGroup(key);
                    toggleGroupDropdown();
                };
                dropdownContent.appendChild(dropdownItem);
            }
        }
    }

    window.loadImages = function(productType) {
        const imageUrls = generateImageUrls(currentGroup, productType);
        slider.max = imageUrls.length; // Set the max value of the slider dynamically
        preloadImages(imageUrls, currentImageIndex); // Pass the current image index
    };

    window.setGroup = function(group) {
        currentGroup = group;
        currentProductType = Object.keys(groups[group].product)[0];
        const dropdownButton = document.querySelector('.dropbtn');
        dropdownButton.textContent = `${groups[currentGroup].label} ▼`; // Update the group name in the button
        createProductGrid(); // Create the product grid dynamically for the selected group
        loadImages(currentProductType); // Load the first set of images for the selected group
        updateTitle(); // Update the title with the current product label
    };

    window.toggleGroupDropdown = function() {
        const dropdownContent = document.getElementById('group-dropdown-content');
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        } else {
            dropdownContent.style.display = 'block';
        }
    };

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            const dropdownContent = document.getElementById('group-dropdown-content');
            const windowWidth = window.innerWidth;
            if (dropdownContent.style.display === 'block' && windowWidth < 1340) {
                dropdownContent.style.display = 'none';
            }
            if (dropdownContent.style.display === 'block') {
                dropdownContent.style.display = 'none';
            }
        }
    };

    // Collapsible section for disclaimer
    const collapsible = document.querySelector('.collapsible');
    const content = document.querySelector('.content');
    collapsible.addEventListener('click', function() {
        this.classList.toggle('active');
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
});
