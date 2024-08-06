document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("product-list");
  const cartContent = document.querySelector(".cart-content");
  const cartQuantityDisplay = document.querySelector(".cart h2 span");
  const cartTotalDisplay = document.querySelector(".cart-total p:last-child");

  // Confirmation Modal
  const confirmOrderButton = document.querySelector(".confirm-order-btn");
  const modal = document.getElementById("order-confirmation-modal");
  const orderSummary = modal.querySelector(".order-summary");
  const totalPriceElement = document.getElementById("total-price-amount");
  const startNewOrderButton = modal.querySelector(".new-order-btn");

  let cart = [];

  fetch("./data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      data.forEach((product) => {
        // Create product card elements
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");

        const productImage = document.createElement("img");
        productImage.src = product.image.desktop;
        productImage.alt = product.name;
        productImage.srcset = `
                  ${product.image.mobile} 375w,
                  ${product.image.tablet} 768w,
                  ${product.image.desktop} 1440w
              `;
        productImage.sizes =
          "(max-width: 375px) 375px, (max-width: 768px) 768px, 1440px";

        const addToCartButton = document.createElement("div");
        addToCartButton.classList.add("add-cart-btn");

        const cartIcon = document.createElement("img");
        cartIcon.src = "assets/images/icon-add-to-cart.svg";
        cartIcon.alt = "Add to Cart Icon";
        cartIcon.classList.add("cart-icon");

        addToCartButton.appendChild(cartIcon);
        addToCartButton.appendChild(document.createTextNode("Add to Cart"));

        imageContainer.appendChild(productImage);
        imageContainer.appendChild(addToCartButton);
        productItem.appendChild(imageContainer);

        const productName = document.createElement("div");
        productName.classList.add("product-name");
        productName.textContent = product.name;

        const productCategory = document.createElement("div");
        productCategory.classList.add("product-type");
        productCategory.textContent = product.category;

        const productPrice = document.createElement("div");
        productPrice.classList.add("product-price");
        productPrice.textContent = `$${product.price.toFixed(2)}`;

        productItem.appendChild(productName);
        productItem.appendChild(productCategory);
        productItem.appendChild(productPrice);

        productList.appendChild(productItem);

        addToCartButton.addEventListener("click", () => {
          const cartItem = cart.find(
            (item) =>
              item.name === product.name && item.category === product.category
          );
          let quantity = cartItem ? cartItem.quantity + 1 : 1;
          updateCart(product, quantity);
        });

        // Update cart function
        function updateCart(product, quantity) {
          // Find the product in the cart
          const cartItem = cart.find(
            (item) =>
              item.name === product.name && item.category === product.category
          );

          if (cartItem) {
            cartItem.quantity = quantity;
          } else {
            cart.push({ ...product, quantity });
          }

          // Update the UI to show increment/decrement controls
          updateCartUI();
          updateProductItemUI(productItem, imageContainer, quantity);
        }

        // Update product item UI
        function updateProductItemUI(productItem, imageContainer, quantity) {
          if (quantity > 0) {
            imageContainer.classList.add("selected");
            addToCartButton.classList.add("selected");
            addToCartButton.innerHTML = `
                        <div class="count-btn">
                            <button class="decrement-btn"></button>
                            <span class="product-quantity">${quantity}</span>
                            <button class="increment-btn"></button>
                        </div>
                    `;

            const decrementBtn =
              addToCartButton.querySelector(".decrement-btn");
            const incrementBtn =
              addToCartButton.querySelector(".increment-btn");

            // Add icons to buttons
            const decrementIcon = document.createElement("img");
            decrementIcon.src = "assets/images/icon-decrement-quantity.svg";
            decrementIcon.alt = "Decrement Icon";
            decrementBtn.appendChild(decrementIcon);

            const incrementIcon = document.createElement("img");
            incrementIcon.src = "assets/images/icon-increment-quantity.svg";
            incrementIcon.alt = "Increment Icon";
            incrementBtn.appendChild(incrementIcon);

            // Handle decrement
            decrementBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              if (quantity > 1) {
                quantity--;
                updateCart(product, quantity);
              } else {
                // Remove from cart when quantity is zero
                removeFromCart(product.name, product.category);
                resetProductItemUI(imageContainer, addToCartButton);
                updateCartUI();
              }
            });

            // Handle increment
            incrementBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              quantity++;
              updateCart(product, quantity);
            });
          } else {
            resetProductItemUI(imageContainer, addToCartButton);
          }
        }
      });
    })
    .catch((error) => console.error("Error fetching data:", error));

  // Update cart UI
  function updateCartUI() {
    cartContent.innerHTML = "";
    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
      totalQuantity += item.quantity;
      totalPrice += item.price * item.quantity;

      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");

      cartItem.innerHTML = `
              <div class="cart-item-details">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>@ $${item.price.toFixed(2)} $${(
        item.price * item.quantity
      ).toFixed(2)}</span>
              </div>
          `;

      const removeButton = document.createElement("button");
      removeButton.classList.add("remove-item");

      // Create and append the icon
      const removeIcon = document.createElement("img");
      removeIcon.src = "assets/images/icon-remove-item.svg";
      removeIcon.alt = "Remove Item";
      removeButton.appendChild(removeIcon);

      // Event listener for the remove button
      removeButton.addEventListener("click", () => {
        removeFromCart(item.name, item.category);

        // Reset UI for corresponding product item
        document.querySelectorAll(".product-item").forEach((productItem) => {
          const productNameElem =
            productItem.querySelector(".product-name").textContent;
          const productCategoryElem =
            productItem.querySelector(".product-type").textContent;

          if (
            productNameElem === item.name &&
            productCategoryElem === item.category
          ) {
            const addToCartButton = productItem.querySelector(".add-cart-btn");
            const imageContainer =
              productItem.querySelector(".image-container");
            resetProductItemUI(imageContainer, addToCartButton);
          }
        });

        // Update the cart UI
        updateCartUI();
      });

      cartItem.appendChild(removeButton);
      cartContent.appendChild(cartItem);
    });

    cartQuantityDisplay.textContent = totalQuantity;
    cartTotalDisplay.textContent = `$${totalPrice.toFixed(2)}`;

    if (cart.length > 0) {
      document.querySelector(".cart-total").style.display = "flex";
      document.querySelector(".icon-carbon-neutral").style.display = "flex";
      document.querySelector(".btn-class").style.display = "flex";
    } else {
      // Show the empty cart state
      document.querySelector(".cart-total").style.display = "none";
      document.querySelector(".icon-carbon-neutral").style.display = "none";
      document.querySelector(".btn-class").style.display = "none";

      // Display empty cart illustration and message
      const emptyCartMessage = document.createElement("div");
      emptyCartMessage.classList.add("empty-cart-message");
      emptyCartMessage.innerHTML = `
              <img src="assets/images/illustration-empty-cart.svg" alt="Empty Cart">
              <p>Your added items will appear here</p>
          `;
      cartContent.appendChild(emptyCartMessage);
    }
  }

  // Function to remove item from cart
  function removeFromCart(name, category) {
    cart = cart.filter(
      (item) => !(item.name === name && item.category === category)
    );
  }

  // Function to reset the product item UI to its default state
  function resetProductItemUI(imageContainer, addToCartButton) {
    imageContainer.classList.remove("selected");
    addToCartButton.classList.remove("selected");
    addToCartButton.innerHTML = "";

    // Reset "Add to Cart" button content
    const cartIcon = document.createElement("img");
    cartIcon.src = "assets/images/icon-add-to-cart.svg";
    cartIcon.alt = "Add to Cart Icon";
    cartIcon.classList.add("cart-icon");
    addToCartButton.appendChild(cartIcon);
    addToCartButton.appendChild(document.createTextNode("Add to Cart"));
  }

  // Function to simulate getting cart items
  function getCartItems() {
    return cart; 
  }

  // Confirmation Function
  confirmOrderButton.addEventListener("click", () => {
    // Use `getCartItems` to get the cart items
    let cartItems = getCartItems();
    let total = 0;

    // Clear any existing content
    orderSummary.innerHTML = "";

    // Populate order items
    cartItems.forEach((item) => {
      const orderItem = document.createElement("div");
      orderItem.classList.add("order-item");
      orderItem.innerHTML = `
              <span>${item.quantity}x ${item.name}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
          `;
      orderSummary.appendChild(orderItem);
      total += item.price * item.quantity;
    });

    // Update total price
    totalPriceElement.textContent = `$${total.toFixed(2)}`;

    // Show the modal
    modal.classList.add("show");
  });

  startNewOrderButton.addEventListener("click", () => {
    // Clear the cart array
    cart = [];

    // Update the cart UI to reflect the empty state
    updateCartUI();

    // Reset the UI for all product items
    document.querySelectorAll(".product-item").forEach((productItem) => {
      const imageContainer = productItem.querySelector(".image-container");
      const addToCartButton = productItem.querySelector(".add-cart-btn");
      resetProductItemUI(imageContainer, addToCartButton);
    });

    // Hide the confirmation modal
    modal.classList.remove("show");
  });
});
