-- Step 1: Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT,
    level TEXT CHECK (level IN ('Coordinator', 'Representative', 'Team Leader')),
    total_hours INT DEFAULT 0,
    badges_appreciate INT DEFAULT 0,
    badges_slap INT DEFAULT 0
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type TEXT,
    event_date DATE,
    event_time TIME,
    status TEXT DEFAULT 'upcoming'
);

CREATE TABLE event_team (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_coordinator BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (event_id, user_id)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES users(id),
    item_description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);

-- Step 2: Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Read Access: All authenticated users can SELECT from all tables.
CREATE POLICY "Select users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Select events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Select event_team" ON event_team FOR SELECT TO authenticated USING (true);
CREATE POLICY "Select tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Select expenses" ON expenses FOR SELECT TO authenticated USING (true);

-- Expenses: Only Team Leader can UPDATE
CREATE POLICY "Update expenses" ON expenses FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND level = 'Team Leader')
);

-- Expenses: Only Coordinators or Team Leaders can INSERT
CREATE POLICY "Insert expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND level IN ('Coordinator', 'Team Leader'))
);
