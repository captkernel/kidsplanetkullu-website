/* Social media page: where its "Posts from Drive" tab reads from.

   folderId  the Drive folder holding the numbered post folders (01-..., 02-...) and ORDER.md.
             Now: Social Media / INSTAGRAM-ORDER.
   apiKey    a Google Cloud API key with the Google Drive API enabled, restricted to
             HTTP referrers https://kidsplanetkullu.com/* and to the Drive API only.
             Empty = the tab says it is not connected yet.

   The folder must be shared as "Anyone with the link can view" for the page to read it.
   A key restricted this way is safe to have in a public page: it only reads files that
   are already viewable by link, and only from this website. */
window.KP_SOCIAL = {
  folderId: "1medlmCdxn5TNCbDFgmaL2W0Ga6m5VOhX",
  apiKey: ""
};
