const fs = require("fs");
const fsPromises = require("fs/promises");
const auth = require("./auth");
const db = require("./database");

// consts
const IS_NULL = "null";
const DOMAIN = "http://localhost:38080";

const scraperObject = {
  // url: `${DOMAIN}/food-uniform/mypage/login.php`,
  url: `https://riki.edu.vn/online/khoa-hoc/video/bai-12-mimikara-oboeru#/`,

  async scraper(browser) {
    // const connection = await db.connection();
    const folderGroup = Date.now();
    // const dirFolder = `imgs/${folderGroup}`;
    const dirFolder = `imgs/evidence`;

    if (!fs.existsSync(dirFolder)) {
      fs.mkdirSync(dirFolder);
    }
    console.log(folderGroup);

    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);


    await page.goto(this.url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("input[name='email_login']");
    await page.type("input[name='email_login']", 'chittschitts2@gmail.com');

    await page.waitForSelector("input[name='password_login']");
    await page.type("input[name='password_login']", 'Duytu1996tb');

    await page.keyboard.press('Enter');

    await this.wait(3000);

    let exam = [];
    for (let i = 0; i < 200; i++) {
      await page.goto(`https://riki.edu.vn/online/api/course/fetchTestByCode?id=${2935 + i}`, { waitUntil: "domcontentloaded" });
      await this.wait(1500);
      let element = await page.$('body')
      let value = await page.evaluate(el => el.textContent, element)
      const response = JSON.parse(value);
      if (response.data) {
        const test = {};
        test.name = response.data.name
        test.question = response.data.questions
  
        exam.push(test);
      }
    }

    fs.writeFileSync('data/file.json', JSON.stringify(exam));

    // await page.waitForFunction(
    //   `console.log(vn_server)`
    // );

    return false;
    await page.waitForSelector(".wrapper");

    await auth.login(page);

    await page.goto(`${DOMAIN}/food-uniform/cart/index.php`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(".wrapper");
    await this.wait(1000);
    // await this.clearCart(page);

    // start add product
    // await page.goto(`${DOMAIN}/food-uniform/product/03-7071/`);
    // await page.waitForSelector(".wrapper");

    // Load testcase
    const testCase = await fsPromises.readFile("data/testCase.csv", {
      encoding: "utf8",
    });

    const data = this.csvJSON(testCase);
    // console.log(data);
    const testCaseStart = 37;
    for (const indexTestCase in data) {
      const item = data[indexTestCase];
      // if (item.No < testCaseStart) continue;
      if (item.No != testCaseStart) continue;
      
      console.log(`Start Test Case ${item.No}`);

      await this.updateProductClass(
        connection,
        ['"03-7071-1-S"'],
        item.instant_delivery1,
        item.delivery_type1,
        item.delivery_type1 == 0 ? "'2024-02-01'" : null
      );
      await this.updateProductClass(
        connection,
        ['"03-7071-1-M"'],
        item.instant_delivery2,
        item.delivery_type2,
        item.delivery_type2 == 0 ? "'2024-02-01'" : null
      );

      await this.updateProductClassStock(
        connection,
        [120855],
        item.free_stock1
      );
      await this.updateProductClassStock(
        connection,
        [120856],
        item.free_stock2
      );

      await this.wait(1000);


      await page.goto(`${DOMAIN}/food-uniform/cart/index.php`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector(".wrapper");
      await this.wait(1000);

      await page.goto(
        `${DOMAIN}/food-uniform/shopping/order_information.php`,
        { waitUntil: "domcontentloaded" }
      );
      await page.waitForSelector('input[value=" 次へ進む"]');
      await page.click('input[value=" 次へ進む"]');

      await page.waitForSelector('input[value="配達希望指定へ進む"]');
      await page.click('div#address-base label.sp_checkbox1');
      await page.click('input[value="配達希望指定へ進む"]');

      await this.wait(3000);
      await page.screenshot({
        path: `${dirFolder}/No-${item.No}-1-start.png`,
        fullPage: true,
      });

      console.log("screenshot start done");

      let block2old = await this.elmExits(page, "#radio7");
      let block2new = await this.elmExits(page, "#shippingSeparately");

      if (block2old) {
        await page.click(".lableradio7");
        await page.screenshot({
          path: `${dirFolder}/No-${item.No}-2-block2-old-lableradio7.png`,
          fullPage: true,
        });

        console.log("screenshot lableradio7 done");

        await page.click(".lableradio8");
        await page.screenshot({
          path: `${dirFolder}/No-${item.No}-3-block2-old-lableradio8.png`,
          fullPage: true,
        });

        console.log("screenshot lableradio8 done");
      }

      if (block2new) {
        await page.click(".block2newshippingTogether");
        await page.screenshot({
          path: `${dirFolder}/No-${item.No}-4-block2-new-block2newshippingTogether.png`,
          fullPage: true,
        });
        console.log("screenshot block2newshippingTogether done");

        await page.click(".block2newshippingSeparately");
        await page.screenshot({
          path: `${dirFolder}/No-${item.No}-5-block2-new-block2newshippingSeparately.png`,
          fullPage: true,
        });
        console.log("screenshot block2newshippingSeparately done");
      }
      //break;
    }

    console.log("Done!!!!!!!!!!!!!!!!");
  },
  csvJSON(csv) {
    const lines = csv.split("\r\n");

    const result = [];

    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      let obj = {};
      let currentline = lines[i].split(",");

      for (let j = 0; j < headers.length; j++) {
        if (currentline[j] === IS_NULL) {
          obj[headers[j]] = null;
        } else {
          obj[headers[j]] = parseInt(currentline[j]);
        }
      }

      result.push(obj);
    }

    return result;
  },
  async logResult(title, obj) {
    let text = "";
    Object.keys(obj).forEach(function (key, index) {
      text += `${key}: ${obj[key]}	`;
    });
    console.log(title);
    console.log(text);
  },
  async clearCart(page) {
    console.log("Start clear cart");
    await page.goto(`${DOMAIN}/food-uniform/cart/index.php`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(".wrapper");

    const btnDelProductInCart = "button.cart_item_delete";
    const producttype = await this.elmExits(page, btnDelProductInCart);

    await page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    while (producttype) {
      await page.waitForSelector(".wrapper");
      if (!(await this.elmExits(page, btnDelProductInCart))) break;
      await page.waitForSelector(btnDelProductInCart);
      await page.click(btnDelProductInCart);
      await page.waitForSelector(".wrapper");
    }
    console.log("Clear cart done");
  },
  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  async updateProductClass(
    connection,
    product_code,
    instant_delivery = null,
    delivery_type = null,
    delivery_date = null
  ) {
    console.log(delivery_date);
    let condition = product_code.join(",");
    const sqlQuery = `UPDATE 
      dtb_products_class AS dpc 
    SET 
      dpc.instant_delivery = ${instant_delivery}, 
      dpc.delivery_type = ${delivery_type}, 
      dpc.delivery_date = ${delivery_date}
    WHERE 
      product_code IN (${condition})`;

    return await db.query(connection, sqlQuery);
  },
  async updateProductClassStock(
    connection,
    product_class_stock_id,
    free_stock = 0
  ) {
    let condition = product_class_stock_id.join(",");
    const sqlQuery = `UPDATE
      dtb_product_class_stock AS dpcs 
    SET
      dpcs.free_stock = ${free_stock}
    WHERE
      dpcs.product_class_stock_id IN (${condition})`;

    return await db.query(connection, sqlQuery);
  },
  async elmExits(page, selector) {
    try {
      return (await page.$(selector)) !== null;
    } catch {
      return false;
    }
  },
  async waitText(text) {
    try {
      return await page.waitForFunction(
        `document.querySelector("body").innerText.includes("${text}")`
      );
    } catch {
      return false;
    }
  },
};

module.exports = scraperObject;
