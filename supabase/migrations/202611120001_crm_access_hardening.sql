-- CRM access hardening. Existing approved rows and business data are not modified.
begin;
drop policy if exists "Verified users can auto-approve their own CRM access" on public.crm_access_requests;
create policy "Verified PW users and CRM admin can self-register"
on public.crm_access_requests for insert to authenticated
with check (
 user_id = auth.uid()
 and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
 and (lower(email) like '%@pw.live' or lower(email) = 'rohitkumarprajapti1996@gmail.com')
 and status = 'approved'
);
drop policy if exists "PW live users can self-approve CRM access" on public.crm_access_requests;
create policy "PW live users can self-approve CRM access"
on public.crm_access_requests for update to authenticated
using (
 user_id = auth.uid()
 and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
 and lower(email) like '%@pw.live'
 and status = 'pending'
)
with check (
 user_id = auth.uid()
 and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
 and lower(email) like '%@pw.live'
 and status = 'approved'
 and reviewed_at is null
 and reviewed_by is null
);
commit;
