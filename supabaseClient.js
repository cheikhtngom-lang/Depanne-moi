// Configuration Supabase
const supabaseUrl = 'https://igjsahmxeqoblkfpzrba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnanNhaG14ZXFvYmxrZnB6cmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1ODkxODgsImV4cCI6MjA5OTE2NTE4OH0.HV7J3wQ8JmoOqX_mOz3GQ0CH5iJ2dipiUPSneJB1jW0';

// Initialisation du client de façon sécurisée
window.db = window.supabase.createClient(supabaseUrl, supabaseKey);
