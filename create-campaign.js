document.addEventListener("DOMContentLoaded", () => {
  const campaignForm = document.getElementById("create-campaign-form");
  const addRewardBtn = document.getElementById("add-reward-btn");
  const rewardsContainer = document.getElementById("rewards-container");
  const campaignImageInput = document.getElementById("campaign-image-input");

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  if (!loggedInUser) {
    alert("You must be logged in to create a campaign.");
    window.location.href = "login.html";
    return;
  }

  addRewardBtn.addEventListener("click", () => {
    const rewardItem = document.createElement("div");
    rewardItem.className = "reward-item";
    rewardItem.innerHTML = `
            <div class="form-group">
                <label>Reward Title:</label>
                <input type="text" class="reward-title" required />
            </div>
            <div class="form-group">
                <label>Amount ($):</label>
                <input type="number" class="reward-amount" required />
            </div>
            <button type="button" class="remove-reward-btn">Remove</button>
        `;
    rewardsContainer.appendChild(rewardItem);

    rewardItem
      .querySelector(".remove-reward-btn")
      .addEventListener("click", () => {
        rewardItem.remove();
      });
  });

  campaignForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("campaign-title").value;
    const description = document.getElementById("campaign-description").value;
    const goal = parseFloat(document.getElementById("campaign-goal").value);
    const deadline = document.getElementById("campaign-deadline").value;
    const category = document.getElementById("category").value;
    const creatorId = loggedInUser.id;
    const isApproved = false;

    const rewards = [];
    document.querySelectorAll(".reward-item").forEach((item, index) => {
      const rewardTitle = item.querySelector(".reward-title").value;
      const rewardAmount = parseFloat(
        item.querySelector(".reward-amount").value
      );
      rewards.push({ id: index + 1, title: rewardTitle, amount: rewardAmount });
    });

    const campaignImageFile = campaignImageInput.files[0];
    let base64ImageString = null;

    const newCampaign = {
      title,
      description,
      goal,
      deadline,
      creatorId,
      isApproved,
      rewards,
      category,
      currentAmount: 0,
      base64Image: null,
    };

    if (campaignImageFile) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        newCampaign.base64Image = e.target.result;
        await sendCampaignData(newCampaign);
      };

      reader.readAsDataURL(campaignImageFile);
    } else {
      await sendCampaignData(newCampaign);
    }
  });

  async function sendCampaignData(newCampaign) {
    try {
      const response = await fetch("http://localhost:5000/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCampaign),
      });

      if (response.ok) {
        const newCampaignData = await response.json();

        window.location.href = `campaign-details.html?id=${newCampaignData.id}`;
      } else {
        alert("Failed to create campaign. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  }
});
