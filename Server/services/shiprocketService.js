const axios = require("axios")

class ShiprocketService {
  constructor() {
    this.baseURL = "https://apiv2.shiprocket.in/v1/external"
    this.token = null
    this.tokenExpiry = null
  }

  // Authenticate with Shiprocket
  async authenticate() {
    try {
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token
      }

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      })

      this.token = response.data.token
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      return this.token
    } catch (error) {
      console.error("Shiprocket authentication error:", error.response?.data || error.message)
      throw new Error("Failed to authenticate with Shiprocket")
    }
  }

  // Create order on Shiprocket
  async createOrder(order) {
    try {
      const token = await this.authenticate()

      const orderData = {
        order_id: order.orderNumber,
        order_date: order.createdAt.toISOString().split("T")[0],
        pickup_location: "Primary",
        billing_customer_name: order.shippingAddress.fullName,
        billing_last_name: "",
        billing_address: order.shippingAddress.addressLine1,
        billing_address_2: order.shippingAddress.addressLine2 || "",
        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.pinCode,
        billing_state: order.shippingAddress.state,
        billing_country: "India",
        billing_email: order.user.email || "customer@fashionhub.com",
        billing_phone: order.shippingAddress.phoneNumber.replace("+91", ""),
        shipping_is_billing: true,
        order_items: order.items.map((item) => ({
          name: item.name,
          sku: `${item.product}-${item.size}`,
          units: item.quantity,
          selling_price: item.price,
          discount: "",
          tax: "",
          hsn: 441122,
        })),
        payment_method: "Prepaid",
        shipping_charges: order.pricing.shippingCharges,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: order.pricing.discount,
        sub_total: order.pricing.subtotal,
        length: 10,
        breadth: 15,
        height: 20,
        weight: 0.5,
      }

      const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      return response.data
    } catch (error) {
      console.error("Shiprocket create order error:", error.response?.data || error.message)
      throw new Error("Failed to create order on Shiprocket")
    }
  }

  // Track shipment
  async trackShipment(awbCode) {
    try {
      const token = await this.authenticate()

      const response = await axios.get(`${this.baseURL}/courier/track/awb/${awbCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    } catch (error) {
      console.error("Shiprocket tracking error:", error.response?.data || error.message)
      throw new Error("Failed to track shipment")
    }
  }

  // Cancel shipment
  async cancelShipment(awbCode) {
    try {
      const token = await this.authenticate()

      const response = await axios.post(
        `${this.baseURL}/orders/cancel`,
        {
          awbs: [awbCode],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      return response.data
    } catch (error) {
      console.error("Shiprocket cancel shipment error:", error.response?.data || error.message)
      throw new Error("Failed to cancel shipment")
    }
  }
}

module.exports = new ShiprocketService()
