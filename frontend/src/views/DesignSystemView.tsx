import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Spinner } from '../components/ui/Spinner';
import { Grid } from '../components/ui/Grid';
import { Info, CheckCircle2, AlertTriangle, XCircle, Search, ArrowRight } from 'lucide-react';

export const DesignSystemView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('codeme_theme') === 'dark');

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    const rootEl = document.documentElement;
    if (nextTheme) rootEl.setAttribute('data-theme', 'dark');
    else rootEl.removeAttribute('data-theme');
    localStorage.setItem('codeme_theme', nextTheme ? 'dark' : 'light');
  };

  return (
    <div className="full-screen-view">
      <div className="container" style={{ paddingBottom: '100px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1>Design System</h1>
            <p>Component library and design tokens for CodeMe Academy.</p>
          </div>
          <Button onClick={toggleTheme} variant="outline">
            Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
          </Button>
        </div>

        <Grid columns={1} gap="lg">
          
          {/* Typography */}
          <section>
            <h2>Typography</h2>
            <Card>
              <CardContent className="space-y">
                <h1>Display H1 (36px)</h1>
                <h2>Heading H2 (30px)</h2>
                <h3>Heading H3 (24px)</h3>
                <h4>Heading H4 (20px)</h4>
                <h5>Heading H5 (18px)</h5>
                <h6>Heading H6 (16px)</h6>
                <p>Paragraph Text (16px). This is a standard block of text to demonstrate the body typography scale and line height. The quick brown fox jumps over the lazy dog.</p>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Small Text (14px)</span>
              </CardContent>
            </Card>
          </section>

          {/* Buttons */}
          <section>
            <h2>Buttons</h2>
            <Card>
              <CardContent>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon" variant="secondary"><ArrowRight size={20} /></Button>
                  <Button isLoading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Forms */}
          <section>
            <h2>Forms & Inputs</h2>
            <Grid columns={2} gap="md">
              <Card>
                <CardContent className="space-y">
                  <Input label="Standard Input" placeholder="Enter text..." />
                  <Input label="With Icons" placeholder="Search..." leftIcon={<Search size={18} />} />
                  <Input label="Error State" placeholder="Enter email" error="Invalid email address" defaultValue="invalid-email" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y">
                  <Select label="Role Selection" helperText="Choose your account type">
                    <option>Student</option>
                    <option>Teacher</option>
                    <option>Admin</option>
                  </Select>
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <Checkbox label="I agree to the terms and conditions" />
                    <Checkbox label="Subscribe to newsletter" />
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </section>

          {/* Feedback */}
          <section>
            <h2>Feedback & Badges</h2>
            <Card>
              <CardContent className="space-y">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </div>

                <div className="space-y">
                  <Alert variant="info" icon={<Info size={20} />} title="Information">
                    This is an informational alert to guide users.
                  </Alert>
                  <Alert variant="success" icon={<CheckCircle2 size={20} />} title="Success">
                    Your changes have been saved successfully.
                  </Alert>
                  <Alert variant="warning" icon={<AlertTriangle size={20} />} title="Warning">
                    Your subscription is expiring soon.
                  </Alert>
                  <Alert variant="danger" icon={<XCircle size={20} />} title="Error">
                    Failed to connect to the database. Please try again.
                  </Alert>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                  <span>Spinners:</span>
                  <Spinner size={16} />
                  <Spinner size={24} color="var(--color-secondary-500)" />
                  <Spinner size={32} color="var(--color-danger)" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cards & Modals */}
          <section>
            <h2>Layout Components</h2>
            <Grid columns={2} gap="md">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>This is a reusable card description.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content goes here. The structure is standardized with Header, Content, and Footer segments.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost">Cancel</Button>
                  <Button>Submit</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'var(--space-4)' }}>
                  <p style={{ textAlign: 'center' }}>Test the global modal overlay system.</p>
                  <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                </CardContent>
              </Card>
            </Grid>
          </section>

          {/* Tables */}
          <section>
            <h2>Data Tables</h2>
            <Card>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Joined</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Alice Johnson</Td>
                    <Td>Student</Td>
                    <Td><Badge variant="success">Active</Badge></Td>
                    <Td>Jan 12, 2026</Td>
                  </Tr>
                  <Tr>
                    <Td>Bob Smith</Td>
                    <Td>Teacher</Td>
                    <Td><Badge variant="warning">Pending</Badge></Td>
                    <Td>Feb 04, 2026</Td>
                  </Tr>
                  <Tr>
                    <Td>Charlie Davis</Td>
                    <Td>Admin</Td>
                    <Td><Badge variant="danger">Suspended</Badge></Td>
                    <Td>Mar 19, 2026</Td>
                  </Tr>
                </Tbody>
              </Table>
            </Card>
          </section>

        </Grid>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setIsModalOpen(false)}>Delete Record</Button>
          </>
        }
      >
        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
      </Modal>

    </div>
  );
};
