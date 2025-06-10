// The redirect function is designed to redirect the user to a new URL.
// It takes a single argument href which is a string representing the URL.
// Upon invocation, it sets location.href to the provided URL, thereby navigating to the webpage.
// While no validation logic is currently implemented prior to redirection,
// there is the potential for such checks to be included in the future as per your requirements.
export const redirect = (href: string) => {
  // 这里后续可以补充一些校验逻辑
  location.href = href;
};
