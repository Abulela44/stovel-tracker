<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The stokvel dashboard remains a single tabbed page, but authenticated workspace records persist in Lovable Cloud so users can continue securely across devices.
- Home-screen installation is manifest-only with no service worker, preventing stale previews while meeting the requested phone installation flow.
- Group access is shared via workspace_members roles (admin/officer/member) enforced by RLS + update trigger; audit rows are written only by database functions, never directly by the client — so permissions and the log can't be bypassed from the browser.
