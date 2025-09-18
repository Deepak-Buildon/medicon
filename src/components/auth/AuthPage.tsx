import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, LogIn } from "lucide-react";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-fit">
            {isLogin ? (
              <LogIn className="h-8 w-8 text-primary" />
            ) : (
              <UserPlus className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your QuickDose account' : 'Join QuickDose as a buyer'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLogin ? <LoginForm /> : <RegisterForm />}
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full"
            >
              {isLogin ? 'Create New Account' : 'Sign In Instead'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};