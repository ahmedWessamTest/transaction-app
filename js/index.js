// ==== global ====
const $loading = $("#loading");
const $detailsTable = $("#detailsTable");
// // ==== when start ====
init();
// ==== events ====
// ==== functions ====
async function init() {
  toggleLoading(true);
  await customersDisplay();
  $(".tableBtn").on("click", async (event) => {
    toggleLoading(true);
    const userId = event.target.dataset.id;
    await displayCustomerData(userId);
    await displayChart(userId);
    sectionNavigator("customerDetails");
    closeBtn();
    toggleLoading(false);
  });
  filterSelector();
  toggleLoading(false);
}
function filterSelector() {
  $("#filterInput").on("change", async (event) => {
    const value = event.target.value;
    console.log(value);
    await customersDisplay(value);
  });
}
function closeBtn() {
  $("#prevBtn").on("click", () => {
    sectionNavigator("customersSection");
    $detailsTable.html("");
    $("#chart").html("");
  });
}
async function makeCustomerObject() {
  const customersResponse = await fetchCustomersData();
  const transactionsResponse = await fetchTransactionData();
  let sortData = [];
  customersResponse.forEach((element) => {
    let transactionsNumber = 0;
    let transactionsAmount = 0;
    transactionsResponse.forEach((tElement) => {
      if (tElement.customer_id === element.id) {
        transactionsNumber++;
        transactionsAmount += tElement.amount;
      }
    });
    sortData.push({
      sortId: element.id,
      sortName: element.name,
      sortAmount: transactionsAmount,
      sortTransaction: transactionsNumber,
    });
  });
  return sortData;
}
function dynamicSort(property) {
  let sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    const result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

async function filterData(filterType) {
  const customerObject = await makeCustomerObject();
  switch (filterType) {
    case "sortName":
      return customerObject.sort(dynamicSort("sortName"));
      break;
    case "sortAmount":
      return customerObject.sort(dynamicSort("sortAmount"));
    default:
      return customerObject;
  }
}

async function customersDisplay(sortType = "") {
  const element = await filterData(sortType);
  try {
    box = ``;
    element.forEach((element) => {
      box +=`
        <tr>
          <td>${element.sortId}</td>
          <td class="text-capitalize">${element.sortName}</td>
          <td>${element.sortAmount}</td>
          <td>${element.sortTransaction}</td>
          <td>
            <button data-id="${element.sortId}" class="btn tableBtn">
              view
            </button>
          </td>
        </tr>
      `;
    });
    $("#customersBody").html(box);
  } catch (error) {
    console.error("Error display customers data:", error);
  }
}
async function fetchCustomersData() {
  try {
    const api = await fetch("http://localhost:3000/customers");
    if (!api.ok) {
      throw new Error(`HTTP error! status: ${api.status}`);
    }

    return await api.json();
  } catch (error) {
    console.error("Error fetching customer data:", error);
    throw error;
  }
}

async function fetchTransactionData() {
  try {
    const api = await fetch("http://localhost:3000/transactions");
    if (!api.ok) {
      throw new Error(`HTTP error! status: ${api.status}`);
    }

    return await api.json();
  } catch (error) {
    console.error("Error fetching transactions data:", error);
    throw error;
  }
}

async function fetchCustomerDetails(customerId) {
  try {
    const api = await fetch(
      `http://localhost:3000/transactions?customer_id=${customerId}`
    );
    if (!api.ok) {
      throw new Error(`HTTP error! status: ${api.status}`);
    }

    return await api.json();
  } catch (error) {
    console.error("Error fetching customer details data:", error);
    throw error;
  }
}
async function displayCustomerData(customerId) {
  try {
    const detailsResponse = await fetchCustomerDetails(customerId);
    let box = ``;
    detailsResponse.forEach((element) => {
      box += `
            <tr>
                <td>${element.id}</td>
                <td class="text-capitalize">${element.date}</td>
                <td>${element.amount}</td>
            </tr>
            `;
    });

    $detailsTable.html(box);
  } catch (error) {
    console.error("Error display customer display data: ", error);
  }
}
function sectionNavigator(section) {
  $("section").hide(0);
  $(`#${section}`).show(0);
}
async function fetchCustomerName(customerId) {
  try {
    const api = await fetch(`http://localhost:3000/customers?id=${customerId}`);
    if (!api.ok) {
      throw new Error(`HTTP error! status: ${api.status}`);
    }

    return await api.json();
  } catch (error) {
    console.error("Error fetching customer name data:", error);
    throw error;
  }
}
async function displayChart(customerId) {
  const detailsResponse = await fetchCustomerDetails(customerId);
  const userName = await fetchCustomerName(detailsResponse[0].customer_id);
  let userDetails = [];
  detailsResponse.forEach((element) => {
    userDetails.push({ x: new Date(element.date), y: element.amount });
  });
  const options = {
    series: [
      {
        name: "Transactions",
        data: [...userDetails],
      },
    ],
    chart: {
      height: 350,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    title: {
      text: `Transactions for ${userName[0].name}`,
      align: "left",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#263238",
        fontFamily: "Poppins, sans-serif",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    markers: {
      size: 0,
    },
    xaxis: {
      type: "datetime",
    },
    tooltip: {
      x: {
        format: "dd/MM/yy",
      },
    },
  };

  const chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}
function toggleLoading(show) {
  $loading.toggle(show);
}
