import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [cardInfo, setCardInfo] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [focusField, setFocusField] = useState("");

  const handleChange = (e) => {
    setCardInfo({ ...cardInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardInfo.name || !cardInfo.number || !cardInfo.expiry || !cardInfo.cvv) {
      toast.error("Please fill all payment fields.");
      return;
    }

    toast.success("Payment Successful!");
    setTimeout(() => navigate("/thankyou"), 1000); // Redirect after success
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 flex flex-col md:flex-row items-center justify-center gap-16">
      {/* Card Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold mb-4">Virtual Payment</h2>

        <div>
          <label className="block mb-1">Cardholder Name</label>
          <input
            name="name"
            value={cardInfo.name}
            onChange={handleChange}
            onFocus={() => setFocusField("name")}
            className="w-full px-4 py-3 rounded bg-[#E5CBBE] text-[#181818] focus:outline-none"
            placeholder="Your Name"
          />
        </div>

        <div>
          <label className="block mb-1">Card Number</label>
          <input
            name="number"
            value={cardInfo.number}
            onChange={handleChange}
            onFocus={() => setFocusField("number")}
            className="w-full px-4 py-3 rounded bg-[#E5CBBE] text-[#181818] focus:outline-none"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1">Expiry Date</label>
            <input
              name="expiry"
              value={cardInfo.expiry}
              onChange={handleChange}
              onFocus={() => setFocusField("expiry")}
              className="w-full px-4 py-3 rounded bg-[#E5CBBE] text-[#181818] focus:outline-none"
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>

          <div className="flex-1">
            <label className="block mb-1">CVV</label>
            <input
              name="cvv"
              value={cardInfo.cvv}
              onChange={handleChange}
              onFocus={() => setFocusField("cvv")}
              className="w-full px-4 py-3 rounded bg-[#E5CBBE] text-[#181818] focus:outline-none"
              placeholder="123"
              maxLength={3}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-14 bg-[#A58077] text-white rounded-lg text-lg font-semibold hover:bg-[#E5CBBE] hover:text-[#181818] transition-all"
        >
          Pay Now
        </button>
      </form>

      {/* Card Preview */}
      <div className="relative w-[320px] h-[200px] bg-gradient-to-br from-[#A58077] to-[#E5CBBE] text-[#181818] rounded-xl p-6 shadow-xl">
        <div className="text-sm mb-2">Card Preview</div>
        <div className="text-xl tracking-widest font-bold mb-4">
          {cardInfo.number || "**** **** **** ****"}
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <div className="uppercase text-xs">Cardholder</div>
            <div>{cardInfo.name || "Your Name"}</div>
          </div>
          <div>
            <div className="uppercase text-xs">Expiry</div>
            <div>{cardInfo.expiry || "MM/YY"}</div>
          </div>
        </div>
        {focusField === "cvv" && (
          <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-sm rounded-bl-xl">
            CVV: {cardInfo.cvv || "***"}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
