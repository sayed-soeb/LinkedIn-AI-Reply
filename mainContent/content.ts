import editIcon from "~/assets/icon1.svg";
import addIcon from "~/assets/icon2.svg";
import createIcon from "~/assets/icon3.svg";
import reloadIcon from "~/assets/icon4.svg";

// Script targeting LinkedIn pages
export default defineContentScript({
  matches: ["*://*.linkedin.com/*"], // Apply to LinkedIn pages
  main() {
    // HTML structure for the custom modal that pops up
    const modalTemplate = `
    <div id="custom-modal" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: none; justify-content: center; align-items: center; z-index: 4000;">
      <div id="modal-box" style="background: white; border-radius: 8px; width: 100%; max-width: 570px; padding: 20px;">
        <div id="message-area" style="margin-top: 10px; max-height: 200px; overflow-y: auto; padding: 10px; display: flex; flex-direction: column;"></div>
        <div style="margin-bottom: 10px;">
          <input id="input-field" type="text" placeholder="Enter your prompt" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none; box-shadow: none;"/>
        </div>
        <div style="text-align: right; margin-top: 12px;">
          <button id="add-button" style="background: #fff; color: #666D80; padding: 8px 16px; border: 2px solid #666D80; border-radius: 4px; cursor: pointer; display: none; margin-right: 10px;">
            <img src="${addIcon}" alt="Insert" style="vertical-align: middle; margin-right: 5px; width: 14px; height: 14px;"> 
            <b>Add</b>
          </button>
          <button id="create-button" style="background: #007bff; color: white; padding: 8px 16px; border: 2px solid #007bff; border-radius: 4px; cursor: pointer;">
            <img src="${createIcon}" alt="Generate" style="vertical-align: middle; margin-right: 5px; width: 14px; height: 14px"> 
            <b>Generate</b>
          </button>
        </div>
      </div>
    </div>
  `;

    // Add styling for focused input fields
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
      #input-field {
        transition: border-color 0.3s ease-in-out;
      }
      #input-field:focus {
        outline: none;
        border-color: #ddd;
        box-shadow: none;
      }
    `;
    document.head.appendChild(focusStyle);

    // Add the modal structure to the webpage
    document.body.insertAdjacentHTML("beforeend", modalTemplate);

    // Get references to modal elements for future use
    const modal = document.getElementById("custom-modal") as HTMLDivElement;
    const createButton = document.getElementById("create-button") as HTMLButtonElement;
    const addButton = document.getElementById("add-button") as HTMLButtonElement;
    const inputField = document.getElementById("input-field") as HTMLInputElement;
    const messageBox = document.getElementById("message-area") as HTMLDivElement;

    // Variables for tracking the last generated message and where to insert it
    let recentGeneratedMsg = "";
    let selectedMessageArea: HTMLElement | null = null;

    // Detect clicks on LinkedIn message input areas
    document.addEventListener("click", (event: MouseEvent) => {
      const clickedElement = event.target as HTMLElement;

      // Check if the clicked element is a message input field
      if (
        clickedElement.matches(".msg-form__contenteditable") ||
        clickedElement.closest(".msg-form__contenteditable")
      ) {
        // Set the message input container
        selectedMessageArea =
          clickedElement.closest(".msg-form__container") ||
          clickedElement.closest(".msg-form__contenteditable");

        const messageContainer = selectedMessageArea?.closest(
          ".msg-form_msg-content-container"
        );

        // Activate the message form container visually
        if (selectedMessageArea && messageContainer) {
          messageContainer.classList.add("msg-form_msg-content-container--is-active");
          selectedMessageArea.setAttribute("data-artdeco-is-focused", "true");
        }

        // Add the edit icon if it doesn’t exist already
        if (selectedMessageArea && !selectedMessageArea.querySelector(".edit-icon")) {
          selectedMessageArea.style.position = "relative";

          const icon = document.createElement("img");
          icon.className = "edit-icon";
          icon.src = editIcon;
          icon.alt = "Edit";
          icon.style.position = "absolute";
          icon.style.bottom = "5px";
          icon.style.right = "5px";
          icon.style.width = "30px";
          icon.style.height = "30px";
          icon.style.cursor = "pointer";
          icon.style.zIndex = "1000";
          selectedMessageArea.appendChild(icon);

          // Show modal on icon click
          icon.addEventListener("click", (e) => {
            e.stopPropagation();
            modal.style.display = "flex"; // Show the modal
          });
        }
      }
    });

    // Simple message generator function
    const createMessage = () => {
      const sampleMessages = [
        "I appreciate the opportunity to connect! Let me know if you have any further questions."
      ];
      return sampleMessages[0];
    };

    // Handle 'Generate' button clicks
    createButton.addEventListener("click", (e) => {
      e.stopPropagation();

      // Get the input text
      const enteredText = inputField.value.trim();
      if (!enteredText) return;

      // Display the user’s message in the modal
      const userMessageElement = document.createElement("div");
      userMessageElement.textContent = enteredText;
      Object.assign(userMessageElement.style, {
        backgroundColor: "#DFE1E7",
        color: "#666D80",
        borderRadius: "12px",
        padding: "10px",
        marginBottom: "5px",
        textAlign: "right",
        maxWidth: "80%",
        alignSelf: "flex-end",
        marginLeft: "auto",
      });
      messageBox.appendChild(userMessageElement);

      // Disable 'Generate' button and show a loading indicator
      createButton.disabled = true;
      createButton.textContent = "Loading...";
      createButton.style.backgroundColor = "#666D80";

      // Simulate message creation process
      setTimeout(() => {
        recentGeneratedMsg = createMessage();
        const generatedMsgElement = document.createElement("div");
        generatedMsgElement.textContent = recentGeneratedMsg;
        Object.assign(generatedMsgElement.style, {
          backgroundColor: "#DBEAFE",
          color: "#666D80",
          borderRadius: "12px",
          padding: "10px",
          marginBottom: "5px",
          textAlign: "left",
          maxWidth: "80%",
          alignSelf: "flex-start",
          marginRight: "auto",
        });

        // Show the generated message in the modal
        messageBox.appendChild(generatedMsgElement);
        messageBox.scrollTop = messageBox.scrollHeight; // Scroll to latest message

        // Enable 'Generate' button, change it to 'Regenerate'
        createButton.disabled = false;
        createButton.style.backgroundColor = "#007bff";
        createButton.style.color = "white";
        createButton.innerHTML = `<img src="${reloadIcon}" alt="Regenerate" style="vertical-align: middle; margin-right: 5px; width: 16px; height: 16px"> <b>Regenerate</b>`;

        // Reset the input field and show the 'Add' button
        inputField.value = "";
        addButton.style.display = "inline-block";
      }, 500);
    });

    // Handle 'Add' button click to insert the generated message into the LinkedIn input field
    addButton.addEventListener("click", () => {
      if (recentGeneratedMsg && selectedMessageArea) {
        // Focus on the input field
        selectedMessageArea.focus();

        // Clear placeholder text if necessary
        if (selectedMessageArea.innerText.trim() === "Write a message...") {
          selectedMessageArea.innerHTML = ""; // Remove the placeholder text
        }

        // Insert the generated message
        document.execCommand("insertText", false, recentGeneratedMsg);

        // Hide the 'Add' button and close the modal
        addButton.style.display = "none";
        modal.style.display = "none";
      }
    });

    // Keep focus on the message area when interacting with the modal
    [inputField, createButton, addButton].forEach((element) => {
      element.addEventListener("focus", () => {
        if (selectedMessageArea) {
          selectedMessageArea.setAttribute("data-artdeco-is-focused", "true");
        }
      });
    });

    // Close modal when clicking outside of it
    document.addEventListener("click", (event: MouseEvent) => {
      const clickedElement = event.target as HTMLElement;
      if (!clickedElement.closest("#modal-box") && modal.style.display === "flex") {
        modal.style.display = "none";
      }
    });
  },
});
