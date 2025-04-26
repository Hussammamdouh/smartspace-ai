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
    let { name, value } = e.target;

    // Auto-format card number and expiry
    if (name === "number") {
      value = value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    }
    if (name === "expiry") {
      value = value.replace(/\D/g, "").replace(/^(.{2})(.)/, "$1/$2").substr(0, 5);
    }

    setCardInfo({ ...cardInfo, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, number, expiry, cvv } = cardInfo;
    if (!name || !number || !expiry || !cvv) {
      toast.error("Please fill all payment fields.");
      return;
    }

    toast.success("Payment Successful!");
    setTimeout(() => navigate("/thankyou"), 1000);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] flex flex-col md:flex-row items-center justify-center gap-16 p-8">
      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold mb-2">Virtual Payment</h2>

        <div>
          <label className="block text-sm mb-1">Cardholder Name</label>
          <input
            name="name"
            value={cardInfo.name}
            onChange={handleChange}
            onFocus={() => setFocusField("name")}
            placeholder="Your Name"
            className="w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Card Number</label>
          <input
            name="number"
            value={cardInfo.number}
            onChange={handleChange}
            onFocus={() => setFocusField("number")}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Expiry Date</label>
            <input
              name="expiry"
              value={cardInfo.expiry}
              onChange={handleChange}
              onFocus={() => setFocusField("expiry")}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm mb-1">CVV</label>
            <input
              name="cvv"
              value={cardInfo.cvv}
              onChange={handleChange}
              onFocus={() => setFocusField("cvv")}
              placeholder="123"
              maxLength={3}
              className="w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-14 bg-[#A58077] hover:bg-[#E5CBBE] hover:text-[#181818] text-white text-lg font-semibold rounded-lg transition-all"
        >
          Pay Now
        </button>
      </form>

      {/* Card Preview */}
      <div className="relative w-[320px] h-[200px] bg-gradient-to-br from-[#A58077] to-[#E5CBBE] text-[#181818] rounded-2xl p-6 shadow-2xl animate-fade-in">
        <div className="text-xs mb-2 tracking-wider">CARD PREVIEW</div>
        <div className="text-2xl font-semibold tracking-widest mb-4">
          {cardInfo.number || "**** **** **** ****"}
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <div className="uppercase text-xs">Cardholder</div>
            <div className="font-bold">{cardInfo.name || "Your Name"}</div>
          </div>
          <div>
            <div className="uppercase text-xs">Expiry</div>
            <div className="font-bold">{cardInfo.expiry || "MM/YY"}</div>
          </div>
        </div>

        {/* CVV visible only if focused */}
        {focusField === "cvv" && (
          <div className="absolute top-0 right-0 m-2 px-3 py-1 bg-black text-white text-xs rounded-bl-lg">
            CVV: {cardInfo.cvv || "***"}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
