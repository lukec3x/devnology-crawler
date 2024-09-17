const axios = require("axios");
const cheerio = require("cheerio");

const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/crawler", async (req, res) => {
  try {
    let products = [];

    for (let page = 1; page <= 20; page++) {
      const url = `https://webscraper.io/test-sites/e-commerce/static/computers/laptops?page=${page}`;

      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      $(
        "body > div.wrapper > div.container.test-site > div > div.col-lg-9 > div.row > div"
      ).each(async (index, element) => {
        const product_name = $(element).find("h4 a.title").text().trim();

        // só passa se for da lenovo
        if (!product_name.toLowerCase().includes("lenovo")) {
          return;
        }

        const product = {
          name: product_name,
          price: $(element).find("h4.price").text().trim(),
          price_float: parseFloat(
            $(element).find("h4.price").text().trim().slice(1)
          ),
          description: $(element).find("p.description").text().trim(),
          reviews: $(element).find("div.ratings").text().trim(),
          stars_count: $(element).find("div.ratings span").length,
          memory_swatches_available: [],
          memory_swatches_unavailable: [],
          product_page: `https://webscraper.io${
            $(element).find("h4 a.title").attr().href
          }`,
          origin_page: url,
        };

        const product_response = await axios.get(product.product_page);
        const product_html = product_response.data;
        const product$ = cheerio.load(product_html);

        product$("div.swatches button").each(
          (product_index, product_element) => {
            if (product$(product_element).attr().disabled === "") {
              product.memory_swatches_unavailable.push(
                product$(product_element).text()
              );
            } else {
              product.memory_swatches_available.push(
                product$(product_element).text()
              );
            }
          }
        );

        products.push(product);
      });
    }

    // ordena por preço
    products.sort((a, b) => a.price_float - b.price_float);

    console.log("Produtos:", products);

    res.status(200).json({ products });
  } catch (error) {
    console.error("Erro ao buscar a página:", error);
    res.status(500).json({ message: "Erro ao buscar os dados" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
