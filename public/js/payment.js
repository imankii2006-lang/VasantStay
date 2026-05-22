document.addEventListener("DOMContentLoaded", function () {
  const btn = document.querySelector(".confirm-btn");

  btn.addEventListener("click", async function () {
    try {
      // Pehle Inputs se value nikaal lo
      const checkIn = document.querySelector('input[name="checkIn"]').value;
      const checkOut = document.querySelector('input[name="checkOut"]').value;
      const guests = document.querySelector('select[name="guests"]').value;

      const dynamicAmount = window.APP_DATA.amount;

      // STEP 1: Create Order (Yahan data bhejiye taaki session/notes mein save ho sake)
      const res = await fetch("/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:  dynamicAmount,
          homeId: window.APP_DATA.homeId,
          checkIn: checkIn,   // <--- Add kiya
          checkOut: checkOut, // <--- Add kiya
          guests: guests      // <--- Add kiya
        })
      });

      const order = await res.json();

      const options = {
        key: window.APP_DATA.razorpayKey,
        order_id: order.id,
        handler: async function (response) {

          // STEP 3: Verify Payment (Yahan bhi data bhejiye database entry ke liye)
          await fetch("/payment/verify", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              homeId: window.APP_DATA.homeId,
              amount: dynamicAmount,
              checkIn: checkIn,   // <--- Database entry ke liye yahan se jayega
              checkOut: checkOut,
              guests: guests
            })
          });

          alert("Payment Success");
          window.location.href = "/bookings";
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment Failed");
    }
  });
});