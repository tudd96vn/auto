const auth = {
    async login(page) {
        console.log('start login');
        await page.waitForSelector("input[name='mypage_login_email']");
        await page.type("input[name='mypage_login_email']", 'anbt@rikkeisoft.com');

        await page.waitForSelector("input[name='mypage_login_pass']");
        await page.type("input[name='mypage_login_pass']", '123456');

        const searchResultSelector = "form[name='login_mypage'] button[type='submit']";
        await page.waitForSelector(searchResultSelector);
        await page.click(searchResultSelector);

        await page.waitForSelector(".wrapper");
        console.log('end login');
    }
}

module.exports = auth;